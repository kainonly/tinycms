package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Shop struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name       string             `bson:"name" json:"name"`
	Logo       string             `bson:"logo" json:"logo"`
	Sn         string             `bson:"sn" json:"sn"`
	Principal  string             `bson:"principal" json:"principal"`
	Tel        string             `bson:"tel" json:"tel"`
	Address    string             `bson:"address" json:"address"`
	Bulletin   string             `bson:"bulletin" json:"bulletin"`
	Pictures   []string           `bson:"pictures" json:"pictures"`
	Minimum    ShopMinimum        `bson:"minimum" json:"minimum"`
	Status     bool               `bson:"status" json:"status"`
	CreateTime time.Time          `bson:"create_time" json:"create_time"`
	UpdateTime time.Time          `bson:"update_time" json:"update_time"`
}

type ShopMinimum struct {
	Spending float64 `bson:"spending" json:"spending"`
	Delivery float64 `bson:"delivery" json:"delivery"`
}
