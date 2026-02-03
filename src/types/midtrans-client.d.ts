declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface CoreApiOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  interface SnapRequest {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    [key: string]: any;
  }

  interface SnapResponse {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: SnapRequest): Promise<SnapResponse>;
  }

  class CoreApi {
    constructor(options: CoreApiOptions);
    charge(parameter: any): Promise<any>;
    capture(parameter: any): Promise<any>;
    cancel(orderId: string): Promise<any>;
    expire(orderId: string): Promise<any>;
    refund(orderId: string, parameter?: any): Promise<any>;
    getStatus(orderId: string): Promise<any>;
    getStatusB2B(orderId: string): Promise<any>;
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export = midtransClient;
}