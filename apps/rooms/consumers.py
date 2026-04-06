import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from rooms.models import Room


class VideoChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for video chat room signaling.

    Handles WebRTC signaling (offer/answer/ice-candidate) and room
    participant management. Each room gets a channel-layer group.

    Supported message types from client:
    - join: User joins the room
    - leave: User leaves the room
    - offer: WebRTC SDP offer forwarded to a specific peer
    - answer: WebRTC SDP answer forwarded to a specific peer
    - ice-candidate: ICE candidate forwarded to a specific peer
    - screen-share-started: Notify peers that screen sharing began
    - screen-share-stopped: Notify peers that screen sharing ended
    - chat-message: Text message in the room
    """

    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())
        self.room_uuid = self.scope['url_route']['kwargs']['room_uuid']
        self.room_group_name = f'video_room_{self.room_uuid}'

        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Verify the room exists and is a VIDEO room with active status
        room = await self._get_room()
        if not room:
            await self.close(code=4004)
            return

        if room.type != Room.Type.VIDEO:
            await self.close(code=4003)
            return

        if room.status != Room.Status.ACTIVE:
            await self.close(code=4002)
            return

        # Join the channel group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Notify others that this user left
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.user.id,
                    'username': self.user.username,
                },
            )
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def receive_json(self, content, **kwargs):
        msg_type = content.get('type')

        if msg_type == 'join':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'channel_name': self.channel_name,
                },
            )

        elif msg_type == 'offer':
            await self.channel_layer.send(
                content['target_channel'],
                {
                    'type': 'relay_sdp',
                    'sdp': content['sdp'],
                    'sdp_type': 'offer',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'channel_name': self.channel_name,
                },
            )

        elif msg_type == 'answer':
            await self.channel_layer.send(
                content['target_channel'],
                {
                    'type': 'relay_sdp',
                    'sdp': content['sdp'],
                    'sdp_type': 'answer',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'channel_name': self.channel_name,
                },
            )

        elif msg_type == 'ice-candidate':
            await self.channel_layer.send(
                content['target_channel'],
                {
                    'type': 'relay_ice',
                    'candidate': content['candidate'],
                    'user_id': self.user.id,
                    'username': self.user.username,
                },
            )

        elif msg_type == 'screen-share-started':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'screen_share_started',
                    'user_id': self.user.id,
                    'username': self.user.username,
                },
            )

        elif msg_type == 'screen-share-stopped':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'screen_share_stopped',
                    'user_id': self.user.id,
                    'username': self.user.username,
                },
            )

        elif msg_type == 'chat-message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': content['message'],
                    'user_id': self.user.id,
                    'username': self.user.username,
                },
            )

    # --- Group event handlers (sent to all in group) ---

    async def user_joined(self, event):
        # Don't send to the user who joined
        if event['channel_name'] != self.channel_name:
            await self.send_json({
                'type': 'user-joined',
                'user_id': event['user_id'],
                'username': event['username'],
                'channel_name': event['channel_name'],
            })
        # Send back own channel name to the joiner
        else:
            # The joiner doesn't need their own event
            pass

    async def user_left(self, event):
        await self.send_json({
            'type': 'user-left',
            'user_id': event['user_id'],
            'username': event['username'],
        })

    async def relay_sdp(self, event):
        await self.send_json({
            'type': event['sdp_type'],
            'sdp': event['sdp'],
            'user_id': event['user_id'],
            'username': event['username'],
            'channel_name': event['channel_name'],
        })

    async def relay_ice(self, event):
        await self.send_json({
            'type': 'ice-candidate',
            'candidate': event['candidate'],
            'user_id': event['user_id'],
            'username': event['username'],
        })

    async def screen_share_started(self, event):
        await self.send_json({
            'type': 'screen-share-started',
            'user_id': event['user_id'],
            'username': event['username'],
        })

    async def screen_share_stopped(self, event):
        await self.send_json({
            'type': 'screen-share-stopped',
            'user_id': event['user_id'],
            'username': event['username'],
        })

    async def chat_message(self, event):
        await self.send_json({
            'type': 'chat-message',
            'message': event['message'],
            'user_id': event['user_id'],
            'username': event['username'],
        })

    @database_sync_to_async
    def _get_room(self):
        try:
            return Room.objects.get(uuid=self.room_uuid)
        except Room.DoesNotExist:
            return None
