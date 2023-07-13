package api

import (
	"context"
	"github.com/bytedance/go-tagexpr/v2/binding"
	"github.com/bytedance/go-tagexpr/v2/validator"
	"github.com/bytedance/gopkg/util/logger"
	"github.com/bytedance/sonic/decoder"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/errors"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/google/wire"
	"net/http"
	"rest-demo/common"
)

var Provides = wire.NewSet(
	wire.Struct(new(Controller), "*"),
	wire.Struct(new(Service), "*"),
)

type API struct {
	*common.Inject

	Hertz      *server.Hertz
	Controller *Controller
	Service    *Service
}

func (x *API) Routes(h *server.Hertz) (err error) {
	h.GET("", x.Controller.Ping)
	r := h.Group(":collection")
	{
		r.GET(":id", x.Controller.FindById)
		r.POST("create", x.Controller.Create)
		r.POST("bulk_create", x.Controller.BulkCreate)
		r.POST("size", x.Controller.Size)
		r.POST("find", x.Controller.Find)
		r.POST("find_one", x.Controller.FindOne)
		r.POST("update", x.Controller.Update)
		r.POST("bulk_delete", x.Controller.BulkDelete)
		r.POST("sort", x.Controller.Sort)
		r.PATCH(":id", x.Controller.UpdateById)
		r.PUT(":id", x.Controller.Replace)
		r.DELETE(":id", x.Controller.Delete)
	}
	h.POST("transaction", x.Controller.Transaction)
	h.POST("commit", x.Controller.Commit)
	return
}

//func (x *API) AccessLogs() app.HandlerFunc {
//	return func(ctx context.Context, c *app.RequestContext) {
//		now := time.Now()
//		c.Next(ctx)
//		method := string(c.Request.Header.Method())
//		if method == "GET" {
//			return
//		}
//		var userId string
//		if value, ok := c.Get("identity"); ok {
//			claims := value.(passport.Claims)
//			userId = claims.UserId
//		}
//		x.Transfer.Publish(context.Background(), "access", transfer.Payload{
//			Timestamp: now,
//			Data: map[string]interface{}{
//				"metadata": map[string]interface{}{
//					"method":    method,
//					"path":      string(c.Request.Path()),
//					"user_id":   userId,
//					"client_ip": c.ClientIP(),
//				},
//				"status":     c.Response.StatusCode(),
//				"user_agent": string(c.Request.Header.UserAgent()),
//			},
//			Format: map[string]interface{}{
//				"metadata.user_id": "oid",
//			},
//		})
//	}
//}

func (x *API) ErrHandler() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		c.Next(ctx)
		err := c.Errors.Last()
		if err == nil {
			return
		}

		if err.IsType(errors.ErrorTypePublic) {
			statusCode := http.StatusBadRequest
			result := utils.H{"message": err.Error()}
			if meta, ok := err.Meta.(map[string]interface{}); ok {
				if meta["statusCode"] != nil {
					statusCode = meta["statusCode"].(int)
				}
				if meta["code"] != nil {
					result["code"] = meta["code"]
				}
			}
			c.JSON(statusCode, result)
			return
		}

		switch e := err.Err.(type) {
		case decoder.SyntaxError:
			c.JSON(http.StatusBadRequest, utils.H{
				"code":    0,
				"message": e.Description(),
			})
			break
		case *binding.Error:
			c.JSON(http.StatusBadRequest, utils.H{
				"code":    0,
				"message": e.Error(),
			})
			break
		case *validator.Error:
			c.JSON(http.StatusBadRequest, utils.H{
				"code":    0,
				"message": e.Error(),
			})
			break
		default:
			logger.Error(err)
			c.Status(http.StatusInternalServerError)
		}
	}
}

func (x *API) Initialize(ctx context.Context, testing bool) (h *server.Hertz, err error) {
	h = x.Hertz
	common.RegValidate()
	h.Use(x.ErrHandler())

	if !testing {
		go x.Service.Sync(nil)
	}
	return
}
