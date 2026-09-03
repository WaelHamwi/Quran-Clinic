# DATABASE SCHEMA DESIGNER

MIGRATION 1: users - id,name,email(u),phone(u),country,gender,google_id(null),is_subscribed(0),subscription_expires_at(null),trial_used_count(0),last_active_at(null),password,remember_token,ts,softDeletes

MIGRATION 2-7: roles,permissions,model_has_roles,role_has_permissions,model_has_permissions,media

MIGRATION 8: surahs - id,name,transliteration,type,total_verses,ts

MIGRATION 9: verses - id,surah_id(fk),verse_number,text_uthmani,ts

MIGRATION 10: categories - id,name,slug,icon,display_order,is_active,softDeletes,ts

MIGRATION 11: subcategories - id,category_id(fk),name,slug,display_order,is_active,softDeletes,ts

MIGRATION 12: diseases - id,subcategory_id(fk),name,slug,description,is_general(0),display_order,is_active,softDeletes,ts

MIGRATION 13: disease_aliases - id,disease_id(fk),alias,ts

MIGRATION 14: recordings - id,disease_id(fk),session_number,title,audio_path,duration_seconds,type(enum summarized|detailed, default summarized),plays_count(0),created_by(fk),softDeletes,ts

MIGRATION 15: favorites - id,user_id(fk),disease_id(fk),ts,UNIQUE(user_id,disease_id)

MIGRATION 16: adhkar_categories - id,name,slug,day_number,display_order,is_active,ts

MIGRATION 17: adhkar_items - id,category_id(fk),text,repetitions,daleel,is_for_morning(0),is_for_evening(0),is_for_sleep(0),is_for_waking(0),display_order,ts

MIGRATION 18: adhkar_sections - id,name,adhkar_category_id,display_order,ts

MIGRATION 19: tahsinat_categories - id,name,is_self(0),is_for_others(0),random_order(0),display_order,is_active,ts

MIGRATION 20: tahsinat_items - id,category_id(fk),label,text,repetitions,hint,display_order,ts

MIGRATION 21: courses - id,title,description,instructor_name,price,start_date,whatsapp_link,is_coming_soon(0),is_active,display_order,ts

MIGRATION 22: sponsors - id,name,logo_path,website_url,target_countries,target_genders,is_featured(0),display_on_launch(0),display_order,is_active,ts

MIGRATION 23: sponsor_screen_config - id,is_enabled(1),display_duration_seconds(3),selected_sponsor_id,ts

MIGRATION 24: feedback - id,user_id(fk),service_type,service_id,was_beneficial,likes,dislikes,comment,ts

MIGRATION 25: feature_flags - id,feature_key,is_visible(1),ts

MIGRATION 26: notification_preferences - id,user_id(fk),adhkar_morning_enabled(1),adhkar_evening_enabled(1),adhkar_sleep_enabled(1),adhkar_waking_enabled(1),waking_start_time,waking_end_time,ts

MIGRATION 27: push_notifications - id,user_id(fk),title,body,type,data,read_at,sent_at,ts
