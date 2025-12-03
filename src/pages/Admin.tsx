import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  photo: string;
  hairColor: string;
  bodyType: string;
  hairLength: string;
  nationality: string;
}

const hairColors = ['Блонд', 'Брюнет', 'Рыжий', 'Русый', 'Чёрный'];
const bodyTypes = ['Стройное', 'Спортивное', 'Пышное', 'Среднее'];
const hairLengths = ['Короткие', 'Средние', 'Длинные', 'Очень длинные'];
const nationalities = ['Европейская', 'Азиатская', 'Латиноамериканская', 'Африканская', 'Смешанная'];

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [models, setModels] = useState<ModelData[]>(() => {
    const saved = localStorage.getItem('models');
    return saved ? JSON.parse(saved) : [];
  });

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
    hairColor: '',
    bodyType: '',
    hairLength: '',
    nationality: '',
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddModel = () => {
    if (!selectedFile || !newModel.hairColor || !newModel.bodyType || !newModel.hairLength || !newModel.nationality) {
      alert('Пожалуйста, заполните все поля и выберите фото');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newId = models.length > 0 ? Math.max(...models.map(m => m.id)) + 1 : 1;
      const modelData: ModelData = {
        id: newId,
        photo: reader.result as string,
        hairColor: newModel.hairColor!,
        bodyType: newModel.bodyType!,
        hairLength: newModel.hairLength!,
        nationality: newModel.nationality!,
      };

      const updatedModels = [...models, modelData];
      setModels(updatedModels);
      localStorage.setItem('models', JSON.stringify(updatedModels));

      setNewModel({
        hairColor: '',
        bodyType: '',
        hairLength: '',
        nationality: '',
      });
      setPreviewUrl('');
      setSelectedFile(null);
      
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDeleteModel = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту модель?')) {
      const updatedModels = models.filter(m => m.id !== id);
      setModels(updatedModels);
      localStorage.setItem('models', JSON.stringify(updatedModels));
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="Plus" size={24} />
              Добавить модель
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Фотография</label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-w-xs rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Цвет волос</label>
                <Select
                  value={newModel.hairColor}
                  onValueChange={(value) => setNewModel({ ...newModel, hairColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите цвет" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
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
                    <SelectValue placeholder="Выберите телосложение" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
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
                    <SelectValue placeholder="Выберите длину" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairLengths.map((length) => (
                      <SelectItem key={length} value={length}>
                        {length}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Национальность</label>
                <Select
                  value={newModel.nationality}
                  onValueChange={(value) => setNewModel({ ...newModel, nationality: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите национальность" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalities.map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="space-y-4">
              {models.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="ImageOff" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Пока нет загруженных моделей</p>
                </Card>
              ) : (
                models.map((model) => (
                  <Card key={model.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={model.photo}
                        alt={`Модель ${model.id}`}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
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
                          <Badge variant="outline">{model.hairColor}</Badge>
                          <Badge variant="outline">{model.bodyType}</Badge>
                          <Badge variant="outline">{model.hairLength}</Badge>
                          <Badge variant="outline">{model.nationality}</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;