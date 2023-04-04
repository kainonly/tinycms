package index_test

import (
	"os"
	"server/api"
	"server/bootstrap"
	"testing"
)

var x *api.API

func TestMain(m *testing.M) {
	os.Chdir("../../")
	x, _ = bootstrap.SetupApiTest()
	os.Exit(m.Run())
}
