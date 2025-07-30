/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth';
import { handleCors } from '@/lib/cors';
import { getRoadblock } from '@/actions/roadblock.action';
import { headers, cookies } from 'next/headers';

/**
 * COMPLETE PRIORITY HIERARCHY:
 * 1. Range banners (with end date) have highest priority within their type
 * 2. Single-date banners (no repeat) come next
 * 3. Recurring banners ordered by frequency (yearly > monthly > weekly > daily)
 */
const PRIORITY_MAP = {
    'range-daily': 1,
    'range-weekly': 2,
    'range-monthly': 3,
    'range-yearly': 4,
    'never': 5,
    'yearly': 6,
    'monthly': 7,
    'weekly': 8,
    'daily': 9
};

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ network: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {

        verifyApiKey(req);

        // 2. GET NETWORK FROM QUERY PARAMS ================================
        const { network } = await params;
        if (!network) throw new Error('Network is required');

        // 3. BANNER SELECTION LOGIC =======================================
        const now = new Date();
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || '';
        const currentUrl = headersList.get('referer') || '';
        const authToken = headersList.get('authorization');

        // Device detection
        const isMobile = /Mobile|Android|iP(hone|od)|IEMobile/.test(userAgent);
        const isTablet = /Tablet|iPad|PlayBook|Silk/.test(userAgent);
        const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

        // Location detection
        const isArticle = currentUrl.includes('/article');
        const location = isArticle ? 'article' : 'homepage';
        const isLoggedIn = !!authToken;

        // Fetch banners
        const allBanners = await getRoadblock(network);

        // Filter and prioritize banners
        const eligibleBanners = allBanners?.data?.filter(banner => {
            // 3.1 ACTIVE STATUS CHECK
            if (!banner.isActive) return false;

            // 3.2 DATE RANGE VALIDATION
            const startDate = new Date(banner.startDate);
            if (now < startDate) return false;

            const isRangeBanner = banner.endDate !== null;
            const endDate = banner.endDate ? new Date(banner.endDate) : null;

            if (isRangeBanner && now > endDate!) return false;

            // 3.3 DEVICE COMPATIBILITY
            if (banner.devices !== 'all' && banner.devices !== deviceType) return false;

            // 3.4 LOCATION CHECK
            if (banner.location !== 'both' && banner.location !== location) return false;

            // 3.5 LOGGED IN USER CHECK
            if (banner.hideForLoggedIn && isLoggedIn) return false;

            // 3.6 RECURRENCE LOGIC
            if (banner.repeat === 'never') {
                return isSameDay(now, startDate);
            }

            if (isRangeBanner) {
                switch (banner.repeat) {
                    case 'daily': return true;
                    case 'weekly': return now.getDay() === startDate.getDay();
                    case 'monthly': return now.getDate() === startDate.getDate();
                    case 'yearly':
                        return now.getMonth() === startDate.getMonth() &&
                            now.getDate() === startDate.getDate();
                }
            }

            switch (banner.repeat) {
                case 'daily': return true;
                case 'weekly': return now.getDay() === startDate.getDay();
                case 'monthly': return now.getDate() === startDate.getDate();
                case 'yearly':
                    return now.getMonth() === startDate.getMonth() &&
                        now.getDate() === startDate.getDate();
                default: return false;
            }
        })
            .map(banner => {
                // Define the type for valid priority keys
                type PriorityKey = keyof typeof PRIORITY_MAP;

                // Determine the priority key with type safety
                const priorityKey: PriorityKey = banner.endDate
                    ? `range-${banner.repeat}` as PriorityKey
                    : banner.repeat as PriorityKey;

                return {
                    ...banner,
                    priority: PRIORITY_MAP[priorityKey] ?? 10 // Nullish coalescing as fallback
                };
            })
            .sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            });

        // 4. DISMISSAL HANDLING ===========================================
        const cookieStore = await cookies();
        const activeBanner = eligibleBanners?.find(banner => {
            const dismissalKey = `banner_dismissed_${banner._id}`;
            const dismissalCookie = cookieStore.get(dismissalKey);

            if (!dismissalCookie) return true;

            const dismissalDate = new Date(dismissalCookie.value);

            switch (banner.repeat) {
                case 'never': return false;
                case 'daily': return !isSameDay(dismissalDate, now);
                case 'weekly': return !isSameWeek(dismissalDate, now);
                case 'monthly': return !isSameMonth(dismissalDate, now);
                case 'yearly': return !isSameYear(dismissalDate, now);
                default: return true;
            }
        });

        // 5. RESPONSE PREPARATION =========================================
        const res = NextResponse.json(
            { success: true, data: activeBanner || null },
            { status: 200 }
        );

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;

    } catch (err: any) {
        console.error('Banner selection error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.message.includes('token') ? 401 : 500 }
        );
    }
}

// Date comparison helpers
function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function isSameWeek(date1: Date, date2: Date): boolean {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.abs((date1.getTime() - date2.getTime()) / oneDayMs);
    return diffDays < 7 && date1.getDay() === date2.getDay();
}

function isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth();
}

function isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
}




// Banner Selection Flow
// Context Collection:

// Gathers device type, location, auth status

// Gets current timestamp for all comparisons

// Banner Filtering:

// Checks active status and date ranges

// Validates device compatibility

// Verifies location rules

// Handles logged-in user preferences

// Applies recurrence patterns:

// Range banners: Active every recurrence within date range

// Standard banners: Active only on recurrence dates

// Prioritization:

// First assigns priority scores

// Sorts by priority then by start date (newest first)

// Dismissal Handling:

// Checks cookies for previous dismissals

// Respects dismissal duration based on recurrence:

// Never: Permanent dismissal

// Daily: Shows again next day

// Weekly: Shows again next week

// Monthly: Shows again next month

// Yearly: Shows again next year