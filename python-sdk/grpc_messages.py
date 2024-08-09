import asyncio
import grpc
import world_pb2
import world_pb2_grpc
import types_pb2
import json
from google.protobuf.json_format import MessageToJson
import base64

def decode_base64(data):
    try:
        decoded = base64.b64decode(data)
        # If it's a hex string, return it as is
        if all(c in '0123456789abcdefABCDEF' for c in decoded.decode('ascii', errors='ignore')):
            return decoded.decode('ascii')
        # If it's all null bytes except the last one or two, interpret as an integer
        if decoded.strip(b'\x00'):
            return int.from_bytes(decoded, 'big')
        # Otherwise, return hex representation
        return decoded.hex()
    except Exception:
        # If decoding fails, return the original data
        return data

def parse_event(event):
    parsed_event = {
        "keys": [decode_base64(key) for key in event.get("keys", [])],
        "data": [decode_base64(item) for item in event.get("data", [])],
        "transactionHash": decode_base64(event.get("transactionHash", ""))
    }
    return parsed_event

async def subscribe_to_all_messages(stub):
    # Generic request for most methods
    generic_request = world_pb2.SubscribeEntitiesRequest(
        clauses=[
            types_pb2.EntityKeysClause(
                keys=types_pb2.KeysClause(
                    keys=[],
                    pattern_matching=types_pb2.PatternMatching.VariableLen,
                    models=[]
                )
            )
        ]
    )

    # Specific request for SubscribeModels
    models_request = world_pb2.SubscribeModelsRequest(
        models_keys=[
            types_pb2.ModelKeysClause(
                model="",  # Leave this empty for now
                keys=[]
            )
        ]
    )

    # List of all subscription methods with their names and requests
    subscription_methods = [
        ("SubscribeEvents", stub.SubscribeEvents, generic_request),
        #("SubscribeEntities", stub.SubscribeEntities, generic_request),
        ("SubscribeEventMessages", stub.SubscribeEventMessages, generic_request),
        # Commented out SubscribeModels for now
        # ("SubscribeModels", stub.SubscribeModels, models_request)
    ]

    async def listen_to_stream(method_name, method, request):
        try:
            print(f"Attempting to subscribe to {method_name}...")
            async for response in method(request):
                json_response = json.loads(MessageToJson(response))
                
                if method_name == "SubscribeEvents" and "event" in json_response:
                    json_response["event"] = parse_event(json_response["event"])
                
                formatted_response = json.dumps(json_response, indent=2)
                with open('grpc_messages.json', 'a') as f:
                    f.write(f"Method: {method_name}\n")
                    f.write(formatted_response + '\n\n')
                print(f"Received message from {method_name}:")
                print(formatted_response)
                print("---")
        except grpc.RpcError as e:
            print(f"RPC error in {method_name}: {e}")
            if "invalid namespaced model" in str(e):
                print(f"The SubscribeModels method requires a valid model name. Please update the models_request.")
        except Exception as e:
            print(f"Unexpected error in {method_name}: {e}")

    # Start all subscriptions concurrently
    await asyncio.gather(*(listen_to_stream(name, method, request) for name, method, request in subscription_methods))

    # Optionally try SubscribeModels separately
    try:
        print("Attempting to subscribe to SubscribeModels...")
        async for response in stub.SubscribeModels(models_request):
            json_response = MessageToJson(response)
            with open('grpc_messages.json', 'a') as f:
                f.write("Method: SubscribeModels\n")
                f.write(json_response + '\n\n')
            print("Received message from SubscribeModels:")
            print(json_response)
            print("---")
    except grpc.RpcError as e:
        print(f"RPC error in SubscribeModels: {e}")
        print("To use SubscribeModels, you need to specify a valid namespaced model.")
        print("Update the 'model' field in the models_request with the correct model name.")

async def run():
    channel = grpc.aio.insecure_channel('localhost:8080')
    stub = world_pb2_grpc.WorldStub(channel)

    try:
        await subscribe_to_all_messages(stub)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await channel.close()

if __name__ == "__main__":
    open('grpc_messages.json', 'w').close()
    print("Listening to all gRPC messages. Press Ctrl+C to stop.")
    asyncio.run(run())