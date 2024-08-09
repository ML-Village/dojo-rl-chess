import asyncio
import grpc
import world_pb2
import world_pb2_grpc
import types_pb2

import json
from google.protobuf.json_format import MessageToJson

async def subscribe_to_events(stub):
    request = world_pb2.SubscribeEventsRequest(
        keys=types_pb2.KeysClause(
            keys=[],
            pattern_matching=types_pb2.PatternMatching.FixedLen
        )
    )

    try:
        async for response in stub.SubscribeEvents(request):
            print("Received event:")
            print(f"Keys: {response.event.keys}")
            print(f"Data: {response.event.data}")
            print(f"Transaction Hash: {response.event.transaction_hash.hex()}")
            print("---")
    except grpc.RpcError as e:
        print(f"RPC error in SubscribeEvents: {e}")

async def subscribe_to_event_messages(stub):
    request = world_pb2.SubscribeEntitiesRequest(
        clauses=[
            types_pb2.EntityKeysClause(
                keys=types_pb2.KeysClause(
                    keys=[],
                    pattern_matching=types_pb2.PatternMatching.VariableLen,
                )
            )
        ]
    )

    try:
        async for response in stub.SubscribeEventMessages(request):
            json_response = MessageToJson(response)
            json_msg = json.loads(json_response)
            print("Received event message:")
            # print(f"Entity: {response.entity}")
            # print(f"Subscription ID: {response.subscription_id}")
            # print("---")
            # print("json response")
            #print(json_response)
            # keys of json_response
            print(json_msg)
            print()
            print("hashedKeys: ", json_msg.get("entity",{}).get("hashedKeys",{}))
            models = json_msg.get("entity",{}).get("models",{})
            models = models[0] if isinstance(models, list) else models
            print("name: ", models.get("name", {}))
            print()
            details = models.get("children", {})

            for r in details:
                print()
                print(r.get("name", {}))
                print(r.keys())
                print(r.get("ty",{}).values())
                print(r.get("key",{}))

    except grpc.RpcError as e:
        print(f"RPC error in SubscribeEventMessages: {e}")

async def run():
    channel = grpc.aio.insecure_channel('localhost:8080')
    stub = world_pb2_grpc.WorldStub(channel)

    try:
        await asyncio.gather(
            subscribe_to_events(stub),
            subscribe_to_event_messages(stub)
        )
    finally:
        await channel.close()

if __name__ == "__main__":
    asyncio.run(run())