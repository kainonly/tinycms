package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Restaurant struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name        string             `bson:"name" json:"name"`
	Code        string             `bson:"code" json:"code"`
	Tel         string             `bson:"tel" json:"tel"`
	Location    string             `bson:"location" json:"location"`
	Description string             `bson:"description" json:"description"`
	Logo        string             `bson:"logo" json:"logo"`
	Pictures    []string           `bson:"pictures" json:"pictures"`
	Flavors     []string           `bson:"flavors" json:"flavors"`
	Enabled     RestaurantEnabled  `bson:"enabled" json:"enabled"`
	Status      bool               `bson:"status" json:"status"`
	CreateTime  time.Time          `bson:"create_time" json:"create_time"`
	UpdateTime  time.Time          `bson:"update_time" json:"update_time"`
}

type RestaurantEnabled struct {
	MinimumSpending bool `bson:"minimum_spending" json:"minimum_spending"`
	MiniWechatpay   bool `bson:"mini_wechatpay" json:"mini_wechatpay"`
	Tea             bool `bson:"tea" json:"tea"`
}
