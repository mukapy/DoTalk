from django.contrib import admin
from django.contrib.admin import ModelAdmin

from categories.models import Category, Topic, TopicRequest


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)


@admin.register(Topic)
class TopicAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_by')
    search_fields = ('name',)
    list_filter = ('is_active', 'created_by')


@admin.register(TopicRequest)
class TopicRequestAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'status', 'created_by', 'reviewed_by', 'reviewed_at', 'created_at')
    search_fields = ('name',)
    list_filter = ('status', 'created_by', 'reviewed_by')
    readonly_fields = ('slug', 'created_at', 'updated_at')
