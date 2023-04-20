package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Dish struct {
	ID              primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`
	ShopId          primitive.ObjectID   `bson:"shop_id" json:"shop_id"`
	Sn              string               `bson:"sn" json:"sn"`
	Name            string               `bson:"name" json:"name"`
	Pinyin          string               `bson:"pinyin" json:"pinyin"`
	Signature       bool                 `bson:"signature" json:"signature"`
	Cold            bool                 `bson:"cold" json:"cold"`
	Tags            []primitive.ObjectID `bson:"tags" json:"tags"`
	Price           float64              `bson:"price" json:"price"`
	Vip             *float64             `bson:"vip" json:"vip"`
	Weigh           bool                 `bson:"weigh" json:"weigh"`
	ByTime          bool                 `bson:"by_time" json:"by_time"`
	Cost            float64              `bson:"cost" json:"cost"`
	Commission      float64              `bson:"commission" json:"commission"`
	Discount        bool                 `bson:"discount" json:"discount"`
	MinimumQuantity int64                `bson:"minimum_quantity" json:"minimum_quantity"`
	Dine            *DishDine            `bson:"dine" json:"dine"`
	Takeout         *DishTakeout         `bson:"takeout" json:"takeout"`
	Special         *DishSpecial         `bson:"special" json:"special"`
	Specification   *DishSpecification   `bson:"specification" json:"specification"`
	Preorder        *DishPreorder        `bson:"preorder" json:"preorder"`
	Methods         []primitive.ObjectID `bson:"methods" json:"methods"`
	Flavors         []primitive.ObjectID `bson:"flavors" json:"flavors"`
	Logo            string               `bson:"logo" json:"logo"`
	Pictures        []string             `bson:"pictures" json:"pictures"`
	Introduction    string               `bson:"introduction" json:"introduction"`
	SoldOut         bool                 `bson:"sold_out" json:"sold_out"`
	Sales           int64                `bson:"sales" json:"sales"`
	Status          bool                 `bson:"status" json:"status"`
	Sort            int64                `bson:"sort" json:"sort"`
	CreateTime      time.Time            `bson:"create_time" json:"create_time"`
	UpdateTime      time.Time            `bson:"update_time" json:"update_time"`
}

type DishDine struct {
	Service float64 `bson:"service" json:"service"`
	Tax     float64 `bson:"tax" json:"tax"`
}

type DishTakeout struct {
	Service float64 `bson:"service" json:"service"`
	Tax     float64 `bson:"tax" json:"tax"`
}

type DishSpecial struct {
	Price        float64     `bson:"price" json:"price"`
	Period       []time.Time `bson:"period" json:"period"`
	MaximumOrder int64       `bson:"maximum_order" json:"maximum_order"`
	MaximumDaily int64       `bson:"maximum_daily" json:"maximum_daily"`
}

type DishSpecification struct {
	Unit  int64                   `bson:"unit" json:"unit"`
	Items []DishSpecificationItem `bson:"items" json:"items"`
}

type DishSpecificationItem struct {
	Name     string  `bson:"name" json:"name"`
	Original int64   `bson:"original" json:"original"`
	Price    float64 `bson:"price" json:"price"`
	Cost     float64 `bson:"cost" json:"cost"`
	Vip      float64 `bson:"vip" json:"vip"`
	Default  bool    `bson:"default" json:"default"`
	Enabled  bool    `bson:"enabled" json:"enabled"`
}

type DishPreorder struct {
	Way      int64 `bson:"way" json:"way"`
	Quantity int64 `bson:"quantity" json:"quantity"`
}
