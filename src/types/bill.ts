export interface CreateBillInput {
    purchaseOrder: string;
    billAmount: number;
    dueDate: string;
    category: string;
    clientId: string;
}