package model_test

import (
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"os"
	"server/bootstrap"
	"server/common"
	"testing"
)

var values *common.Values
var client *mongo.Client
var db *mongo.Database

func TestMain(m *testing.M) {
	var err error
	values, err := bootstrap.LoadStaticValues()
	if err != nil {
		panic(err)
	}
	if client, err = bootstrap.UseMongoDB(values); err != nil {
		log.Fatalln(err)
	}
	db = bootstrap.UseDatabase(values, client)
	os.Exit(m.Run())
}
