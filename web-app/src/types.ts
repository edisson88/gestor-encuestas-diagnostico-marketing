import type {Answers,Instrument} from '@vr/instrument';
export type User={id:string;name:string;email:string;role:'ADMIN'|'APPLICATOR'};
export type Version={id:string;version:string;definition:Instrument;active:boolean};
export type Diagnostic={id:string;businessCode:string;phase:'PILOT'|'DEFINITIVE';status:'DRAFT'|'COMPLETE';answers:Answers;notes:string;revision:number;createdAt:string;updatedAt:string;completedAt?:string;instrumentId:string;instrument:Version;applicator:{name:string};consentText:string};
export type Study={institution:string;responsible:string;contact:string;dataAccess:string;custody:string;retention:string;ready:boolean;consent:string};
export type ItemSummary={id:string;label:string;kind:string;total:number;valid:number;missing:number;unknown:number;notApplicable:number;skipped:number;distribution:{value:string;label:string;count:number;percentage:number}[];texts:string[]};
export type Summary={total:number;registered:number;drafts:number;items:ItemSummary[];priorities:{value:string;label:string;count:number;percentage:number;firstCount:number}[]};
