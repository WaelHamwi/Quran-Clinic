# SEEDER DESIGNER

QURAN SEEDER: QuranSeeder.php
SOURCE: https://cdn.jsdelivr.net/npm/quran-cloud@1.0.0/dist/quran.json
IMPLEMENTATION: fetch JSON, parse 114 surahs, insert into surahs, loop verses insert into verses (6,236 total)

DISEASE_SEEDER: inserts categories, subcategories, diseases, disease_aliases, recordings (1st, 2nd, 3rd sessions)

ADHKAR_SEEDER: inserts adhkar_categories (Morning, Evening, Sleep, Waking), adhkar_items with repetitions and daleel

TAHSINAT_SEEDER: inserts tahsinat_categories (Self, Others), tahsinat_items with labels, text, repetitions, hints

SPONSOR_SEEDER: inserts sponsors with logos, sponsor_screen_config

FEATURE_FLAG_SEEDER: inserts feature_flags for all top-level features (hospital, adhkar, tahsinat, mushaf, courses, ask_me)

RUN COMMAND: php artisan db:seed --class=QuranSeeder && php artisan db:seed --class=DiseaseSeeder && php artisan db:seed --class=AdhkarSeeder && php artisan db:seed --class=TahsinatSeeder && php artisan db:seed --class=SponsorSeeder && php artisan db:seed --class=FeatureFlagSeeder

OUTPUT: ```php <?php [code with no comments] ```
