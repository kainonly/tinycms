package api_test

import (
	"fmt"
	"github.com/bytedance/sonic"
	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"
	"rest-demo/api"
	"testing"
)

func MockSubscribe(t *testing.T, ch chan api.PublishDto) {
	name := fmt.Sprintf(`%s:events:%s`, x.V.Namespace, "projects")
	subject := fmt.Sprintf(`%s.events.%s`, x.V.Namespace, "projects")
	_, err := x.JetStream.QueueSubscribe(subject, name, func(msg *nats.Msg) {
		var data api.PublishDto
		err := sonic.Unmarshal(msg.Data, &data)
		assert.NoError(t, err)

		ch <- data

		msg.Ack()
	}, nats.ManualAck())

	assert.NoError(t, err)
}

func RemoveStream(t *testing.T) {
	name := fmt.Sprintf(`%s:events:%s`, x.V.Namespace, "projects")
	err := x.JetStream.DeleteStream(name)
	assert.NoError(t, err)
}

func RecoverStream(t *testing.T) {
	name := fmt.Sprintf(`%s:events:%s`, x.V.Namespace, "projects")
	subject := fmt.Sprintf(`%s.events.%s`, x.V.Namespace, "projects")
	_, err := x.JetStream.AddStream(&nats.StreamConfig{
		Name:      name,
		Subjects:  []string{subject},
		Retention: nats.WorkQueuePolicy,
	})
	assert.NoError(t, err)
}
