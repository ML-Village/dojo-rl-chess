import asyncio
import grpc
import world_pb2
import world_pb2_grpc
import types_pb2
import json
from google.protobuf.json_format import MessageToJson

def root_dict_value(d):
    for v in d.values():
        if isinstance(v, dict):
            return root_dict_value(v)
        else:
            return v

def entity_dict_value(d):
    if isinstance(d, dict):
        first_key = next(iter(d.keys()))
        if first_key == "primitive":
            return root_dict_value(d.get("primitive",{}).get("value", {}))
        elif first_key == "enum":
            return d.get("enum",{}).get("option", "")
        elif first_key == "struct":
            return [{c.get("name", "") : entity_dict_value(c.get("ty",{}))} for c in d.get("struct",{}).get("children", [])]
        else:
            return d
    else:
        return d


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

    # List of all subscription methods with their names and requests
    subscription_methods = [
        #("SubscribeEvents", stub.SubscribeEvents, generic_request),
        ("SubscribeEntities", stub.SubscribeEntities, generic_request),
        ("SubscribeEventMessages", stub.SubscribeEventMessages, generic_request),
        # Commented out SubscribeModels for now
        # ("SubscribeModels", stub.SubscribeModels, models_request)
    ]

    async def listen_to_stream(method_name, method, request):
        try:
            print(f"Attempting to subscribe to {method_name}...")
            async for response in method(request):
                json_response = json.loads(MessageToJson(response))
                
                if method_name == 'SubscribeEntities':
                    print()
                    print(f"Received message from {method_name}:")
                    print()
                    #print(json_response.get("entity",{}).get("models",{}))
                    modelslist = json_response.get("entity",{}).get("models",{})

                    for m in modelslist:
                        modelname = m.get("name",{})
                        print()
                        print("Entity Event Name: ", modelname)

                        modelchildren = m.get("children",{})
                        # for c in modelchildren:
                        #     print()
                        #     print(c.get("name", {}), entity_dict_value(c.get("ty",{})))
                            #print(c.get("ty", {}))
                        
                        print(modelname,
                            [{c.get("name", {}) : entity_dict_value(c.get("ty",{}))}
                            for c in modelchildren])

                elif method_name == 'SubscribeEventMessages':
                    print()
                    print(f"Received message from {method_name}:")
                    print()
                    #print(json_response.get("entity",{}).get("models",{}))
                    modelslist = json_response.get("entity",{}).get("models",{})
                    
                    for m in modelslist:
                        modelname = m.get("name",{})
                        print()
                        print("Event Message Name: ", modelname)

                        modelchildren = m.get("children",{})
                        # for c in modelchildren:
                        #     print()
                        #     print(c.get("name", {}), entity_dict_value(c.get("ty",{})))
                            #print(c.get("ty", {}))
                        print(modelname,
                            [{c.get("name", {}) : entity_dict_value(c.get("ty",{}))}
                            for c in modelchildren])
                
        except grpc.RpcError as e:
            print(f"RPC error in {method_name}: {e}")
            if "invalid namespaced model" in str(e):
                print(f"The SubscribeModels method requires a valid model name. Please update the models_request.")
        except Exception as e:
            print(f"Unexpected error in {method_name}: {e}")

    # Start all subscriptions concurrently
    await asyncio.gather(*(listen_to_stream(name, method, request) for name, method, request in subscription_methods))

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