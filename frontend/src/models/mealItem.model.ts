export default interface MealItem {
    name: string;
    price: number;
    longitude: number;
    latitude: number;
    rating: number;
    storeName: string;
    imgUrl: string;
    distance: number; // in kilometers
}
