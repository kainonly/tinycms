//go:build wireinject
// +build wireinject

package bootstrap

import (
	"github.com/google/wire"
	"server/admin"
	"server/api"
	"server/common"
)

func InitializeAPI(values *common.Values) (*api.API, error) {
	wire.Build(
		wire.Struct(new(api.API), "*"),
		wire.Struct(new(common.Inject), "*"),
		UseMongoDB,
		UseDatabase,
		UseRedis,
		UseNats,
		UseJetStream,
		UseKeyValue,
		UseApi,
		api.Provides,
	)
	return &api.API{}, nil
}

func InitializeAdmin(values *common.Values) (*admin.API, error) {
	wire.Build(
		wire.Struct(new(admin.API), "*"),
		wire.Struct(new(common.Inject), "*"),
		UseMongoDB,
		UseDatabase,
		UseRedis,
		UseNats,
		UseJetStream,
		UseKeyValue,
		UseValues,
		UseResources,
		UseSessions,
		UseCsrf,
		UsePassport,
		UseLocker,
		UseCaptcha,
		UseTransfer,
		UseAdmin,
		admin.Provides,
	)
	return &admin.API{}, nil
}
