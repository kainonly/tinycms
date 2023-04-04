package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Area struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	RestaurantId primitive.ObjectID `bson:"restaurant_id" json:"restaurant_id"`
	Name         string             `bson:"name" json:"name"`
	Tea          AreaTea            `bson:"tea" json:"tea"`
	Status       bool               `bson:"status" json:"status"`
}

type AreaTea struct {
	Fee     float64 `bson:"fee" json:"fee"`
	Service float64 `bson:"service" json:"service"`
	Tax     float64 `bson:"tax" json:"tax"`
}
