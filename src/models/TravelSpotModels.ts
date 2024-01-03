export interface ITravelSpot {
    id: number;
    title: string;
    description: string;
    hashtags: string[];
    image: string[];
    comments: string[];
    userId: String
  }
  
  export interface ITravelSpotResponse {
    travel_spots_by_id: ITravelSpot;
  }
  
  export interface ITravelSpotsResponse {
    travel_spots: ITravelSpot[];
  }
  
  export interface INewTravelSpot {
    id: number;
    title: string;
    description: string;
    hashtags: string[];
    image: string[];
    userId: String
  }
  