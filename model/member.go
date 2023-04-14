package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Member struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	LevelId    primitive.ObjectID `bson:"level_id" json:"level_id"`
	Cardno     string             `bson:"cardno" json:"cardno"`
	Phone      string             `bson:"phone" json:"phone"`
	Password   string             `bson:"password" json:"password"`
	Profile    MemberProfile      `bson:"profile" json:"profile"`
	Location   MemberLocation     `bson:"location" json:"location"`
	Wechat     MemberWechat       `bson:"wechat" json:"wechat"`
	Points     int64              `bson:"points" json:"points"`
	Balance    float64            `bson:"balance" json:"balance"`
	Income     float64            `bson:"income" json:"income"`
	Spending   float64            `bson:"spending" json:"spending"`
	Source     string             `bson:"source" json:"source"`
	Status     bool               `bson:"status" json:"status"`
	CreateTime time.Time          `bson:"create_time" json:"create_time"`
	UpdateTime time.Time          `bson:"update_time" json:"update_time"`
}

type MemberProfile struct {
	Nickname string `bson:"nickname" json:"nickname"`
	Name     string `bson:"name" json:"name"`
	Gender   string `bson:"gender" json:"gender"`
	Avatar   string `bson:"avatar" json:"avatar"`
	Tel      string `bson:"tel" json:"tel"`
	Birthday string `bson:"birthday" json:"birthday"`
}

type MemberLocation struct {
	Country  string `bson:"country" json:"country"`
	Province string `bson:"province" json:"province"`
	City     string `bson:"city" json:"city"`
}

type MemberWechat struct {
	Openid      string `bson:"openid" json:"openid"`
	Unionid     string `bson:"unionid" json:"unionid"`
	Recommender string `bson:"recommender" json:"recommender"`
}
