package index_test

import (
	"os"
	"server/admin"
	"server/bootstrap"
	"testing"
)

var x *admin.API

func TestMain(m *testing.M) {
	os.Chdir("../../")
	x, _ = bootstrap.SetupAdminTest()
	os.Exit(m.Run())
}
