CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  photos TEXT[] NOT NULL,
  face_type VARCHAR(100),
  eye_color VARCHAR(100),
  skin_color VARCHAR(100),
  body_type VARCHAR(100),
  hair_color VARCHAR(100),
  hair_length VARCHAR(100),
  hair_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS filters (
  id SERIAL PRIMARY KEY,
  face_types TEXT[] DEFAULT '{}',
  eye_colors TEXT[] DEFAULT '{}',
  skin_colors TEXT[] DEFAULT '{}',
  body_types TEXT[] DEFAULT '{}',
  hair_colors TEXT[] DEFAULT '{}',
  hair_lengths TEXT[] DEFAULT '{}',
  hair_types TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO filters (face_types, eye_colors, skin_colors, body_types, hair_colors, hair_lengths, hair_types)
VALUES (
  ARRAY['Европейская', 'Азиатская', 'Африканская', 'Латино-американская'],
  ARRAY['Голубые', 'Карие', 'Черные', 'Зеленые', 'Серые'],
  ARRAY['Смуглая', 'Темная', 'Оливковая', 'Светлая'],
  ARRAY['Стройное', 'Спортивное', 'Худощавое', 'Пышное', 'Среднее'],
  ARRAY['Блондинка', 'Рыжая', 'Брюнетка', 'Шатенка', 'Пепельная блондинка'],
  ARRAY['Короткая', 'Средние', 'Длинные', 'Очень длинные'],
  ARRAY['Прямые', 'Вьющиеся', 'Кучерявые']
);