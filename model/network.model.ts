import mongoose, { Document, models } from 'mongoose';

export interface INetwork extends Document {
    domainName: string;
    province: string;
    district: string;
    mpUmp: string;
    wardNumber: string;
    nameOfEditor: string;
    editorMobile: string;
    editorEmail: string;
    nameOfOwner: string;
    ownerPhone: string;
    ownerEmail: string;
    registrationNumber: string;
    panNumber: string;
    suchanaBibhagRegdNumber: string;
    url: string;
    domainRegistryDate: Date;
    domainExpiryDate: Date;
    domainRegistrar: string;
    joinedDate: Date;
    agreementDate: Date;
    totalNumberOfAuthors: number;
}

const NetworkSchema = new mongoose.Schema({
    domainName: { type: String, required: true, unique: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    mpUmp: { type: String, required: true },
    wardNumber: { type: String, required: true },
    nameOfEditor: { type: String, required: true },
    editorMobile: { type: String, required: true },
    editorEmail: { type: String, required: true, unique: true },
    nameOfOwner: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    panNumber: { type: String, required: true },
    suchanaBibhagRegdNumber: { type: String, required: true },
    url: { type: String, required: true },
    domainRegistryDate: { type: Date, required: true },
    domainExpiryDate: { type: Date, required: true },
    domainRegistrar: { type: String, required: true },
    joinedDate: { type: Date, required: true },
    agreementDate: { type: Date, required: true },
    totalNumberOfAuthors: { type: Number, required: true }
});

const Network = models?.Network || mongoose.model('Network', NetworkSchema);
export default Network
