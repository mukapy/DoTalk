from django.contrib import admin

from rooms.models import Room, Category, Topic, Invitation, Message


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'category')
    list_filter = ('category',)
    search_fields = ('name',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'type', 'status', 'capacity', 'visibility', 'category')
    list_filter = ('type', 'status', 'visibility', 'category')
    search_fields = ('name', 'description')


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'initiated_by', 'is_accepted')
    list_filter = ('initiated_by', 'is_accepted')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'room', 'created_at')
    list_filter = ('room',)
