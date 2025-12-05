import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Model {
  id: number;
  photos: string[];
  faceType: string;
  eyeColor: string;
  skinColor: string;
  bodyType: string;
  hairColor: string;
  hairLength: string;
  hairType: string;
}

interface FilterCategories {
  faceTypes: string[];
  eyeColors: string[];
  skinColors: string[];
  bodyTypes: string[];
  hairColors: string[];
  hairLengths: string[];
  hairTypes: string[];
}

const defaultFilters: FilterCategories = {
  faceTypes: ['Европейская', 'Азиатская', 'Африканская', 'Латино-американская'],
  eyeColors: ['Голубые', 'Карие', 'Черные', 'Зеленые', 'Серые'],
  skinColors: ['Смуглая', 'Темная', 'Оливковая', 'Светлая'],
  bodyTypes: ['Стройное', 'Спортивное', 'Худощавое', 'Пышное', 'Среднее'],
  hairColors: ['Блондинка', 'Рыжая', 'Брюнетка', 'Шатенка', 'Пепельная блондинка'],
  hairLengths: ['Короткая', 'Средние', 'Длинные', 'Очень длинные'],
  hairTypes: ['Прямые', 'Вьющиеся', 'Кучерявые'],
};

const Index = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [filters, setFilters] = useState<FilterCategories>(defaultFilters);

  const [selectedFaceType, setSelectedFaceType] = useState<string>('');
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>('');
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [selectedHairColor, setSelectedHairColor] = useState<string>('');
  const [selectedHairLength, setSelectedHairLength] = useState<string>('');
  const [selectedHairType, setSelectedHairType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch('https://functions.poehali.dev/f72a0844-f274-400e-aec2-772ebc3a9106')
      .then(res => res.json())
      .then(data => setModels(Array.isArray(data) ? data : []))
      .catch(console.error);
    
    fetch('https://functions.poehali.dev/2bd93d3a-7865-4599-bd8a-780859652347')
      .then(res => res.json())
      .then(data => setFilters({...defaultFilters, ...data}))
      .catch(console.error);
  }, []);

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      if (selectedFaceType && model.faceType !== selectedFaceType) return false;
      if (selectedEyeColor && model.eyeColor !== selectedEyeColor) return false;
      if (selectedSkinColor && model.skinColor !== selectedSkinColor) return false;
      if (selectedBodyType && model.bodyType !== selectedBodyType) return false;
      if (selectedHairColor && model.hairColor !== selectedHairColor) return false;
      if (selectedHairLength && model.hairLength !== selectedHairLength) return false;
      if (selectedHairType && model.hairType !== selectedHairType) return false;
      return true;
    });
  }, [models, selectedFaceType, selectedEyeColor, selectedSkinColor, selectedBodyType, selectedHairColor, selectedHairLength, selectedHairType]);

  const clearFilters = () => {
    setSelectedFaceType('');
    setSelectedEyeColor('');
    setSelectedSkinColor('');
    setSelectedBodyType('');
    setSelectedHairColor('');
    setSelectedHairLength('');
    setSelectedHairType('');
  };

  const activeFiltersCount = [
    selectedFaceType,
    selectedEyeColor,
    selectedSkinColor,
    selectedBodyType,
    selectedHairColor,
    selectedHairLength,
    selectedHairType
  ].filter(Boolean).length;

  const handlePhotoClick = (modelId: number, photosLength: number) => {
    setCurrentPhotoIndex(prev => ({
      ...prev,
      [modelId]: ((prev[modelId] || 0) + 1) % photosLength
    }));
  };

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
        <div className="sticky top-[89px] z-40 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Тип лица</label>
                <div className="flex flex-wrap gap-2">
                  {filters.faceTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={selectedFaceType === type ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedFaceType(selectedFaceType === type ? '' : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Цвет глаз</label>
                <div className="flex flex-wrap gap-2">
                  {filters.eyeColors.map((color) => (
                    <Badge
                      key={color}
                      variant={selectedEyeColor === color ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedEyeColor(selectedEyeColor === color ? '' : color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Цвет кожи</label>
                <div className="flex flex-wrap gap-2">
                  {filters.skinColors.map((color) => (
                    <Badge
                      key={color}
                      variant={selectedSkinColor === color ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedSkinColor(selectedSkinColor === color ? '' : color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Телосложение</label>
                <div className="flex flex-wrap gap-2">
                  {filters.bodyTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={selectedBodyType === type ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedBodyType(selectedBodyType === type ? '' : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Цвет волос</label>
                <div className="flex flex-wrap gap-2">
                  {filters.hairColors.map((color) => (
                    <Badge
                      key={color}
                      variant={selectedHairColor === color ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedHairColor(selectedHairColor === color ? '' : color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Длина волос</label>
                <div className="flex flex-wrap gap-2">
                  {filters.hairLengths.map((length) => (
                    <Badge
                      key={length}
                      variant={selectedHairLength === length ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedHairLength(selectedHairLength === length ? '' : length)}
                    >
                      {length}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Тип волос</label>
                <div className="flex flex-wrap gap-2">
                  {filters.hairTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={selectedHairType === type ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedHairType(selectedHairType === type ? '' : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full gap-2"
                  >
                    <Icon name="X" size={16} />
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {filteredModels.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="Search" size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Модели не найдены</h2>
            <p className="text-muted-foreground mb-6">
              Попробуйте изменить параметры фильтров
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <Icon name="X" size={16} />
                Сбросить все фильтры
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map((model) => {
              const photoIndex = currentPhotoIndex[model.id] || 0;
              return (
                <Card key={model.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="relative aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/20 cursor-pointer group"
                    onClick={() => handlePhotoClick(model.id, model.photos.length)}
                  >
                    {model.photos && model.photos.length > 0 ? (
                      <>
                        <img
                          src={model.photos[photoIndex]}
                          alt={`Модель ${model.id}`}
                          className="w-full h-full object-cover"
                        />
                        {model.photos.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {model.photos.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === photoIndex ? 'bg-white w-4' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {model.photos.length > 1 && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Icon name="ChevronRight" size={48} className="text-white opacity-0 group-hover:opacity-50 transition-opacity" />
                          </div>
                        )}
                      </>
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

                  <div className="p-4">
                    <h3 className="font-semibold mb-3">
                      Модель #{model.id.toString().padStart(3, '0')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">{model.faceType}</Badge>
                      <Badge variant="outline" className="text-xs">{model.eyeColor}</Badge>
                      <Badge variant="outline" className="text-xs">{model.skinColor}</Badge>
                      <Badge variant="outline" className="text-xs">{model.bodyType}</Badge>
                      <Badge variant="outline" className="text-xs">{model.hairColor}</Badge>
                      <Badge variant="outline" className="text-xs">{model.hairLength}</Badge>
                      <Badge variant="outline" className="text-xs">{model.hairType}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;