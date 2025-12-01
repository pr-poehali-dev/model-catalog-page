import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Model {
  id: number;
  photo?: string;
  hairColor: string;
  bodyType: string;
  hairLength: string;
  nationality: string;
}

const hairColors = ['Блонд', 'Брюнет', 'Рыжий', 'Русый', 'Чёрный'];
const bodyTypes = ['Стройное', 'Спортивное', 'Пышное', 'Среднее'];
const hairLengths = ['Короткие', 'Средние', 'Длинные', 'Очень длинные'];
const nationalities = ['Европейская', 'Азиатская', 'Латиноамериканская', 'Африканская', 'Смешанная'];

const generateModels = (): Model[] => {
  const models: Model[] = [];
  for (let i = 1; i <= 100; i++) {
    models.push({
      id: i,
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
      hairLength: hairLengths[Math.floor(Math.random() * hairLengths.length)],
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
    });
  }
  return models;
};

const Index = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedHairColor, setSelectedHairColor] = useState<string>('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [selectedHairLength, setSelectedHairLength] = useState<string>('');
  const [selectedNationality, setSelectedNationality] = useState<string>('');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const savedModels = localStorage.getItem('models');
    if (savedModels) {
      setModels(JSON.parse(savedModels));
    } else {
      setModels(generateModels());
    }
  }, []);

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      if (selectedHairColor && model.hairColor !== selectedHairColor) return false;
      if (selectedBodyType && model.bodyType !== selectedBodyType) return false;
      if (selectedHairLength && model.hairLength !== selectedHairLength) return false;
      if (selectedNationality && model.nationality !== selectedNationality) return false;
      return true;
    });
  }, [models, selectedHairColor, selectedBodyType, selectedHairLength, selectedNationality]);

  const clearFilters = () => {
    setSelectedHairColor('');
    setSelectedBodyType('');
    setSelectedHairLength('');
    setSelectedNationality('');
  };

  const activeFiltersCount = [selectedHairColor, selectedBodyType, selectedHairLength, selectedNationality].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Каталог моделей</h1>
              <p className="text-sm text-muted-foreground">
                {filteredModels.length} {filteredModels.length === 1 ? 'модель' : filteredModels.length < 5 ? 'модели' : 'моделей'} для ИИ фотосессий
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/admin'}
                className="gap-2"
              >
                <Icon name="Settings" size={18} />
                Админ
              </Button>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Icon name="Filter" size={18} />
                Фильтры
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="border-b border-border bg-card animate-accordion-down">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Icon name="Palette" size={16} />
                  Цвет волос
                </label>
                <div className="flex flex-wrap gap-2">
                  {hairColors.map((color) => (
                    <Badge
                      key={color}
                      variant={selectedHairColor === color ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedHairColor(selectedHairColor === color ? '' : color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Icon name="User" size={16} />
                  Телосложение
                </label>
                <div className="flex flex-wrap gap-2">
                  {bodyTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={selectedBodyType === type ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedBodyType(selectedBodyType === type ? '' : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Icon name="Scissors" size={16} />
                  Длина волос
                </label>
                <div className="flex flex-wrap gap-2">
                  {hairLengths.map((length) => (
                    <Badge
                      key={length}
                      variant={selectedHairLength === length ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedHairLength(selectedHairLength === length ? '' : length)}
                    >
                      {length}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Icon name="Globe" size={16} />
                  Национальность
                </label>
                <div className="flex flex-wrap gap-2">
                  {nationalities.map((nationality) => (
                    <Badge
                      key={nationality}
                      variant={selectedNationality === nationality ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedNationality(selectedNationality === nationality ? '' : nationality)}
                    >
                      {nationality}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <Icon name="X" size={16} />
                  Очистить все фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredModels.map((model) => (
            <Card
              key={model.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/20">
                {model.photo ? (
                  <img
                    src={model.photo}
                    alt={`Модель ${model.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2 p-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="User" size={32} className="text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Модель #{model.id.toString().padStart(3, '0')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    #{model.id}
                  </Badge>
                </div>
              </div>
              <div className="p-3 space-y-2 bg-card">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {model.hairColor}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {model.hairLength}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {model.bodyType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {model.nationality}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-20">
            <Icon name="SearchX" size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Модели не найдены</h3>
            <p className="text-muted-foreground mb-4">Попробуйте изменить параметры фильтрации</p>
            <Button onClick={clearFilters} variant="outline">
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;