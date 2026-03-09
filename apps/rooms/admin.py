from django.contrib import admin
from django.contrib.admin import ModelAdmin

from rooms.models import Room, Invitation, Message


@admin.register(Room)
class RoomAdmin(ModelAdmin):
    list_display = ('name', 'creator', 'type', 'status', 'capacity', 'visibility', 'category')
    list_filter = ('type', 'status', 'visibility', 'category')
    search_fields = ('name', 'description')


@admin.register(Invitation)
class InvitationAdmin(ModelAdmin):
    list_display = ('user', 'room', 'initiated_by', 'is_accepted')
    list_filter = ('initiated_by', 'is_accepted')


@admin.register(Message)
class MessageAdmin(ModelAdmin):
    list_display = ('sender', 'room', 'created_at')
    list_filter = ('room',)
