export interface DeliveryStatus {
    status: string;
    estimatedTime?: string;
    currentLocation?: {
        lat: number;
        lng: number;
    };
} 