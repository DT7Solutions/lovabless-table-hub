import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Grid, List, Edit, Trash2, Star, FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { MenuItem, Category } from '@/types';

export default function MenuManagement() {
  const { categories, menuItems, deleteCategory, deleteMenuItem } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'item', id: string } | null>(null);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'category') {
      const itemsInCategory = menuItems.filter(item => item.categoryId === deleteConfirm.id);
      if (itemsInCategory.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This category has menu items. Please delete or reassign items first.",
          variant: "destructive",
        });
        setDeleteConfirm(null);
        return;
      }
      deleteCategory(deleteConfirm.id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } else {
      deleteMenuItem(deleteConfirm.id);
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    }
    setDeleteConfirm(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddCategoryDialogOpen(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsAddItemDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and categories</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={(open) => {
            setIsAddCategoryDialogOpen(open);
            if (!open) setEditingCategory(null);
          }}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              </DialogHeader>
              <CategoryForm 
                category={editingCategory} 
                onClose={() => {
                  setIsAddCategoryDialogOpen(false);
                  setEditingCategory(null);
                }} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddItemDialogOpen} onOpenChange={(open) => {
            setIsAddItemDialogOpen(open);
            if (!open) setEditingMenuItem(null);
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
              </DialogHeader>
              <MenuItemForm 
                menuItem={editingMenuItem}
                onClose={() => {
                  setIsAddItemDialogOpen(false);
                  setEditingMenuItem(null);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className="shrink-0"
        >
          All Items ({menuItems.length})
        </Button>
        {categories.map(category => {
          const count = menuItems.filter(item => item.categoryId === category.id).length;
          return (
            <div key={category.id} className="relative group shrink-0">
              <Button
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="pr-20"
              >
                {category.name} ({count})
              </Button>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCategory(category);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ type: 'category', id: category.id });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Menu Items Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {getCategoryName(item.categoryId)}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditMenuItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteConfirm({ type: 'item', id: item.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">₹{item.price}</span>
                  {item.averageRating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium">{item.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({item.totalRatings})</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Item</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded bg-muted flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{getCategoryName(item.categoryId)}</Badge>
                      </td>
                      <td className="p-4 font-semibold">₹{item.price}</td>
                      <td className="p-4">
                        {item.averageRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span>{item.averageRating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">({item.totalRatings})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No ratings</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                          {item.isAvailable ? 'Available' : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditMenuItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteConfirm({ type: 'item', id: item.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteConfirm?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryForm({ category, onClose }: { category?: Category | null, onClose: () => void }) {
  const { addCategory, updateCategory, categories } = useData();
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const duplicate = categories.find(
      cat => cat.name.toLowerCase() === name.toLowerCase() && cat.id !== category?.id
    );
    
    if (duplicate) {
      toast({
        title: "Error",
        description: "A category with this name already exists",
        variant: "destructive",
      });
      return;
    }

    if (category) {
      updateCategory(category.id, {
        name: name.trim(),
        description: description.trim(),
        isActive,
        displayOrder,
      });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } else {
      addCategory({
        name: name.trim(),
        description: description.trim(),
        isActive,
        displayOrder,
      });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cat-name">Category Name *</Label>
        <Input 
          id="cat-name" 
          placeholder="Enter category name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
      </div>

      <div>
        <Label htmlFor="cat-description">Description</Label>
        <Textarea 
          id="cat-description" 
          placeholder="Describe the category"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="cat-order">Display Order</Label>
        <Input 
          id="cat-order" 
          type="number" 
          placeholder="0"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="cat-active">Active Status</Label>
        <Switch 
          id="cat-active" 
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {category ? 'Update' : 'Add'} Category
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

function MenuItemForm({ menuItem, onClose }: { menuItem?: MenuItem | null, onClose: () => void }) {
  const { categories, addMenuItem, updateMenuItem, menuItems } = useData();
  const [name, setName] = useState(menuItem?.name || '');
  const [categoryId, setCategoryId] = useState(menuItem?.categoryId || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [price, setPrice] = useState(menuItem?.price?.toString() || '');
  const [prepTime, setPrepTime] = useState(menuItem?.prepTime?.toString() || '');
  const [isAvailable, setIsAvailable] = useState(menuItem?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(menuItem?.isFeatured ?? false);
  const [image, setImage] = useState(menuItem?.image || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !categoryId || !description.trim() || !price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      name: name.trim(),
      categoryId,
      description: description.trim(),
      price: priceNum,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      isAvailable,
      isFeatured,
      image: image.trim() || undefined,
    };

    if (menuItem) {
      updateMenuItem(menuItem.id, itemData);
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
    } else {
      addMenuItem(itemData);
      toast({
        title: "Success",
        description: "Menu item added successfully",
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name *</Label>
        <Input 
          id="name" 
          placeholder="Enter item name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => cat.isActive).map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea 
          id="description" 
          placeholder="Describe the item"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required 
        />
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input 
          id="image" 
          placeholder="https://example.com/image.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required 
          />
        </div>
        <div>
          <Label htmlFor="prepTime">Prep Time (mins)</Label>
          <Input 
            id="prepTime" 
            type="number" 
            placeholder="15"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="available">Available</Label>
        <Switch 
          id="available" 
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="featured">Featured Item</Label>
        <Switch 
          id="featured" 
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {menuItem ? 'Update' : 'Save'} Item
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}
