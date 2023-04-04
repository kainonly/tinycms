package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Table struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	RestaurantId    primitive.ObjectID `bson:"restaurant_id" json:"restaurant_id"`
	AreaId          primitive.ObjectID `bson:"area_id" json:"area_id"`
	Sn              string             `bson:"sn" json:"sn"`
	Alias           string             `bson:"alias" json:"alias"`
	Seats           int64              `bson:"seats" json:"seats"`
	MinimumSpending float64            `bson:"minimum_spending" json:"minimum_spending"`
	Runtime         int64              `bson:"runtime" json:"runtime"`
	Sort            int64              `bson:"sort" json:"sort"`
}
