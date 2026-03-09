from django.contrib import admin
from django.contrib.admin import ModelAdmin

from categories.models import Category, Topic


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)


@admin.register(Topic)
class TopicAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'created_by')
    search_fields = ('name',)
    list_filter = ('created_by',)
