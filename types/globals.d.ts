export { }

// Create a type for the roles
export type Roles = 'admin' | 'editor' | 'manager'

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}