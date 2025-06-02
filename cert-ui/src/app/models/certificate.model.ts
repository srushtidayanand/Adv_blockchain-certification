export interface Certificate {
    certId: number;
    owner: string;
    uri: string;
    originalRecipient: string;
    name: string;
    description: string;
    image: string;
    attributes: any[];
    issuedBy: string;
    issuedTo: string;
    issuedDate: string;
  }