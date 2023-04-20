package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type User struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`
	Email       string               `bson:"email" json:"email"`
	Password    string               `bson:"password" json:"-"`
	Shops       []primitive.ObjectID `bson:"shops" json:"-"`
	Name        string               `bson:"name" json:"name"`
	Avatar      string               `bson:"avatar" json:"avatar"`
	BackupEmail string               `bson:"backup_email" json:"backup_email"`
	Sessions    int64                `bson:"sessions" json:"sessions"`
	History     UserHistory          `bson:"history" json:"history"`
	Status      bool                 `bson:"status" json:"status"`
	CreateTime  time.Time            `bson:"create_time" json:"create_time"`
	UpdateTime  time.Time            `bson:"update_time" json:"update_time"`
}

type UserHistory struct {
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
	ClientIP  string    `bson:"client_ip" json:"client_ip"`
	Country   string    `bson:"country" json:"country"`
	Province  string    `bson:"province" json:"province"`
	City      string    `bson:"city" json:"city"`
	Isp       string    `bson:"isp" json:"isp"`
}

func NewUser(email string, password string) *User {
	return &User{
		Email:      email,
		Password:   password,
		Shops:      []primitive.ObjectID{},
		Status:     true,
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
	}
}
