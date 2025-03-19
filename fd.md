1. Будедет обновлять номенклатуру выполняя следующий запрос
   curl -X 'POST' \
    'https://nikitahub-gru-resta-back-c88a.twc1.net/azs/update-store-prices' \
    -H 'accept: application/json' \
    -d ''

2. Будет делать слудующий запрос на добавление позиций
   https://nikitahub-gru-resta-back-c88a.twc1.net/azs_nomenclature
   это get запрос
