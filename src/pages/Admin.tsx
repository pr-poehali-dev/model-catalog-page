import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModelData {
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

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [models, setModels] = useState<ModelData[]>(() => {
    const saved = localStorage.getItem('models');
    return saved ? JSON.parse(saved) : [];
  });

  const [filters, setFilters] = useState<FilterCategories>(() => {
    const saved = localStorage.getItem('filters');
    return saved ? JSON.parse(saved) : defaultFilters;
  });

  const [newFilterValue, setNewFilterValue] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<keyof FilterCategories>('faceTypes');

  useEffect(() => {
    const authToken = sessionStorage.getItem('adminAuth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin1357') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'authenticated');
      setLoginError('');
    } else {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setUsername('');
    setPassword('');
  };

  const [newModel, setNewModel] = useState<Partial<ModelData>>({
    faceType: '',
    eyeColor: '',
    skinColor: '',
    bodyType: '',
    hairColor: '',
    hairLength: '',
    hairType: '',
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && previewUrls.length < 2) {
      const remaining = 2 - previewUrls.length;
      const filesToProcess = Array.from(files).slice(0, remaining);
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddPhotoUrl = () => {
    if (photoUrl && previewUrls.length < 2) {
      setPreviewUrls(prev => [...prev, photoUrl]);
      setPhotoUrl('');
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddModel = () => {
    if (previewUrls.length === 0) {
      alert('Добавьте хотя бы одну фотографию');
      return;
    }

    if (!newModel.faceType || !newModel.eyeColor || !newModel.skinColor || 
        !newModel.bodyType || !newModel.hairColor || !newModel.hairLength || !newModel.hairType) {
      alert('Заполните все поля');
      return;
    }

    const newId = models.length > 0 ? Math.max(...models.map(m => m.id)) + 1 : 1;
    const modelData: ModelData = {
      id: newId,
      photos: previewUrls,
      faceType: newModel.faceType!,
      eyeColor: newModel.eyeColor!,
      skinColor: newModel.skinColor!,
      bodyType: newModel.bodyType!,
      hairColor: newModel.hairColor!,
      hairLength: newModel.hairLength!,
      hairType: newModel.hairType!,
    };

    const updatedModels = [...models, modelData];
    setModels(updatedModels);
    localStorage.setItem('models', JSON.stringify(updatedModels));

    setNewModel({
      faceType: '',
      eyeColor: '',
      skinColor: '',
      bodyType: '',
      hairColor: '',
      hairLength: '',
      hairType: '',
    });
    setPreviewUrls([]);
    setPhotoUrl('');
    
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteModel = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту модель?')) {
      const updatedModels = models.filter(m => m.id !== id);
      setModels(updatedModels);
      localStorage.setItem('models', JSON.stringify(updatedModels));
    }
  };

  const handleAddFilter = () => {
    if (!newFilterValue.trim()) return;
    
    const updatedFilters = {
      ...filters,
      [selectedFilterCategory]: [...filters[selectedFilterCategory], newFilterValue.trim()]
    };
    setFilters(updatedFilters);
    localStorage.setItem('filters', JSON.stringify(updatedFilters));
    setNewFilterValue('');
  };

  const handleDeleteFilter = (category: keyof FilterCategories, value: string) => {
    const updatedFilters = {
      ...filters,
      [category]: filters[category].filter(v => v !== value)
    };
    setFilters(updatedFilters);
    localStorage.setItem('filters', JSON.stringify(updatedFilters));
  };

  const filterCategoryNames: Record<keyof FilterCategories, string> = {
    faceTypes: 'Тип лица',
    eyeColors: 'Цвет глаз',
    skinColors: 'Цвет кожи',
    bodyTypes: 'Телосложение',
    hairColors: 'Цвет волос',
    hairLengths: 'Длина волос',
    hairTypes: 'Тип волос',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Lock" size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Вход в админ-панель</h1>
            <p className="text-muted-foreground">Введите логин и пароль для доступа</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Логин</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} />
                  {loginError}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" size="lg">
              <Icon name="LogIn" size={18} />
              Войти
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full gap-2"
            >
              <Icon name="ArrowLeft" size={18} />
              Вернуться к каталогу
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Админ-панель</h1>
              <p className="text-sm text-muted-foreground">Управление каталогом моделей</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <Icon name="LogOut" size={18} />
                Выйти
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
                <Icon name="ArrowLeft" size={18} />
                К каталогу
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="models">Модели</TabsTrigger>
            <TabsTrigger value="filters">Фильтры</TabsTrigger>
          </TabsList>

          <TabsContent value="models">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Plus" size={24} />
                  Добавить модель
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Фотографии (до 2-х)
                    </label>
                    
                    <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url')} className="mb-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">С компьютера</TabsTrigger>
                        <TabsTrigger value="url">По ссылке</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {uploadMethod === 'file' ? (
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                        disabled={previewUrls.length >= 2}
                        multiple
                      />
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          disabled={previewUrls.length >= 2}
                        />
                        <Button 
                          onClick={handleAddPhotoUrl}
                          disabled={!photoUrl || previewUrls.length >= 2}
                        >
                          <Icon name="Plus" size={18} />
                        </Button>
                      </div>
                    )}

                    {previewUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full aspect-[3/4] object-cover rounded-lg shadow-md"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => handleRemovePreview(index)}
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Тип лица</label>
                      <Select
                        value={newModel.faceType}
                        onValueChange={(value) => setNewModel({ ...newModel, faceType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.faceTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Цвет глаз</label>
                      <Select
                        value={newModel.eyeColor}
                        onValueChange={(value) => setNewModel({ ...newModel, eyeColor: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.eyeColors.map((color) => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Цвет кожи</label>
                      <Select
                        value={newModel.skinColor}
                        onValueChange={(value) => setNewModel({ ...newModel, skinColor: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.skinColors.map((color) => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Телосложение</label>
                      <Select
                        value={newModel.bodyType}
                        onValueChange={(value) => setNewModel({ ...newModel, bodyType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.bodyTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Цвет волос</label>
                      <Select
                        value={newModel.hairColor}
                        onValueChange={(value) => setNewModel({ ...newModel, hairColor: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.hairColors.map((color) => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Длина волос</label>
                      <Select
                        value={newModel.hairLength}
                        onValueChange={(value) => setNewModel({ ...newModel, hairLength: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.hairLengths.map((length) => (
                            <SelectItem key={length} value={length}>{length}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Тип волос</label>
                      <Select
                        value={newModel.hairType}
                        onValueChange={(value) => setNewModel({ ...newModel, hairType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.hairTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAddModel} className="w-full gap-2" size="lg">
                    <Icon name="Plus" size={18} />
                    Добавить модель
                  </Button>
                </div>
              </Card>

              <div>
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Icon name="Users" size={24} />
                      Загруженные модели
                    </h2>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {models.length}
                    </Badge>
                  </div>
                </Card>

                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {models.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Icon name="ImageOff" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Пока нет загруженных моделей</p>
                    </Card>
                  ) : (
                    models.map((model) => (
                      <Card key={model.id} className="p-4">
                        <div className="flex gap-4">
                          <div className="flex gap-2">
                            {model.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Модель ${model.id} - фото ${index + 1}`}
                                className="w-20 h-28 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold">
                                Модель #{model.id.toString().padStart(3, '0')}
                              </h3>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteModel(model.id)}
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{model.faceType}</Badge>
                              <Badge variant="outline">{model.eyeColor}</Badge>
                              <Badge variant="outline">{model.skinColor}</Badge>
                              <Badge variant="outline">{model.bodyType}</Badge>
                              <Badge variant="outline">{model.hairColor}</Badge>
                              <Badge variant="outline">{model.hairLength}</Badge>
                              <Badge variant="outline">{model.hairType}</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filters">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Plus" size={24} />
                  Добавить значение фильтра
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Категория</label>
                    <Select
                      value={selectedFilterCategory}
                      onValueChange={(value) => setSelectedFilterCategory(value as keyof FilterCategories)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(filterCategoryNames).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Новое значение</label>
                    <div className="flex gap-2">
                      <Input
                        value={newFilterValue}
                        onChange={(e) => setNewFilterValue(e.target.value)}
                        placeholder="Введите значение"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFilter()}
                      />
                      <Button onClick={handleAddFilter} disabled={!newFilterValue.trim()}>
                        <Icon name="Plus" size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div>
                <Card className="p-6 mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon name="Filter" size={24} />
                    Текущие фильтры
                  </h2>
                </Card>

                <div className="space-y-4">
                  {Object.entries(filters).map(([category, values]) => (
                    <Card key={category} className="p-4">
                      <h3 className="font-semibold mb-3">
                        {filterCategoryNames[category as keyof FilterCategories]}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <Badge key={value} variant="secondary" className="gap-2">
                            {value}
                            <button
                              onClick={() => handleDeleteFilter(category as keyof FilterCategories, value)}
                              className="hover:text-destructive"
                            >
                              <Icon name="X" size={14} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
