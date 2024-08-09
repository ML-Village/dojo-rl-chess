import asyncio
from gql import gql, Client
from gql.transport.websockets import WebsocketsTransport
import codecs

# GraphQL subscription query
subscription_query = gql("""
    subscription {
        eventEmitted {
            id
            keys
            data
            transactionHash
        }
    }
""")

async def subscribe_to_events():
    # Initialize the WebSocket transport
    transport = WebsocketsTransport(url='ws://localhost:8080/graphql')
    
    async with Client(transport=transport, fetch_schema_from_transport=True) as session:
        async for result in session.subscribe(subscription_query):
            message = result['eventEmitted']
            print()
            print("id:", message.get("id"))
            print("keys:", message.get("keys"))
            print("data:", message.get("data"))

if __name__ == "__main__":
    asyncio.run(subscribe_to_events())