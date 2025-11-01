import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Grid, List, Edit, Trash2, Star, FolderPlus, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { MenuItem, Category, SubCategory } from '@/types';

export default function MenuManagement() {
  const { categories, subCategories, menuItems, deleteCategory, deleteSubCategory, deleteMenuItem } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedsubCategory, setSelectedsubCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddSubCategoryDialogOpen, setIsAddSubCategoryDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'subcategory' | 'item', id: string } | null>(null);

  const filteredItems = menuItems.filter(item => {
    const name = (item.name || '').toString();
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemCategoryId = item.categoryId ?? (item.categoryId !== undefined ? String(item.categoryId) : undefined);
    const itemSubCategoryId = item.subCategoryId ?? (item.id !== undefined ? String(item.id) : undefined);
    const matchesCategory =
      selectedCategory === 'all' ||
      (itemCategoryId !== undefined && String(itemCategoryId) === String(selectedCategory));
    const matchesSubCategory =
      selectedsubCategory === 'all' ||
      (itemSubCategoryId !== undefined && String(itemSubCategoryId) === String(selectedsubCategory));
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  useEffect(() => {
    setSelectedsubCategory("all");
  }, [selectedCategory]);

  const getCategoryName = (cat: any) => {
    if (!cat) return "Unknown Category";
    return typeof cat === "object" ? cat.name : 
      categories.find((c) => Number(c.id) === Number(cat))?.name || "Unknown Category";
  };

  const getSubCategoryName = (sub: any) => {
    if (!sub) return "Unknown Subcategory";
    return typeof sub === "object" ? sub.name : 
      subCategories.find((s) => Number(s.id) === Number(sub))?.name || "Unknown Subcategory";
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'category') {
      const itemsInCategory = menuItems.filter(item => item.categoryId === deleteConfirm.id);
      const subCatsInCategory = subCategories.filter(sc => sc.categoryId === deleteConfirm.id);
      if (itemsInCategory.length > 0 || subCatsInCategory.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This category has items or subcategories. Please delete them first.",
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
    } else if (deleteConfirm.type === 'subcategory') {
      const itemsInSubCategory = menuItems.filter(item => item.subCategoryId === deleteConfirm.id);
      if (itemsInSubCategory.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This subcategory has menu items. Please delete or reassign them first.",
          variant: "destructive",
        });
        setDeleteConfirm(null);
        return;
      }
      deleteSubCategory(deleteConfirm.id);
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
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

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setIsAddSubCategoryDialogOpen(true);
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
                Add Main Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Main Category' : 'Add New Main Category'}</DialogTitle>
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

          <Dialog open={isAddSubCategoryDialogOpen} onOpenChange={(open) => {
            setIsAddSubCategoryDialogOpen(open);
            if (!open) setEditingSubCategory(null);
          }}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Sub Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSubCategory ? 'Edit Sub Category' : 'Add New Sub Category'}</DialogTitle>
              </DialogHeader>
              <SubCategoryForm 
                subCategory={editingSubCategory} 
                onClose={() => {
                  setIsAddSubCategoryDialogOpen(false);
                  setEditingSubCategory(null);
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </div>

            {/* Category Select */}
            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter((cat: any) => cat.is_active).map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Subcategory Select — Filtered by Category */}
            <Select value={selectedsubCategory}  onValueChange={(val) => setSelectedsubCategory(val)} disabled={selectedCategory === "all"}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Sub Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub Categories</SelectItem>
                  {subCategories.filter((sub: any) => {
                    if (!sub || !sub.is_active) return false;
                    const subMain = sub.categoryId ?? (sub.main_category !== undefined ? String(sub.main_category) : undefined);
                    if (!subMain) return false;
                    return selectedCategory === "all" ? true : Number(subMain) === Number(selectedCategory);
                  }).map((sub: any) => ( <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem> ))}
              </SelectContent>
            </Select>

            {/* View Mode Buttons */}
            <div className="flex gap-2">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")} >
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")} >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => {setSelectedCategory("all"); setSelectedsubCategory("all"); setSearchQuery("")}}
          className="shrink-0"
        >
          All Items ({menuItems.length})
        </Button>

        {categories.map((category: any) => {
          const subCount = subCategories.filter((sub: any) => { const subMain = sub.categoryId ?? (sub.main_category !== undefined ? String(sub.main_category) : undefined);
            return subMain !== undefined && Number(subMain) === Number(category.id);
          }).length;
          const itemCount = menuItems.filter((item: any) => { const itemMain = item.categoryId ?? (item.main_category !== undefined ? String(item.main_category) : undefined);
            return itemMain !== undefined && Number(itemMain) === Number(category.id);
          }).length;

          return (
            <div key={category.id} className="relative group shrink-0">
              <Button  variant={Number(selectedCategory) === Number(category.id) ? "default" : "outline"} onClick={() => {setSelectedCategory(String(category.id)); setSelectedsubCategory("all")} } className="pr-10" >
                {category.name} ({itemCount} items / {subCount} sub)
              </Button>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-accent" onClick={(e) => { e.stopPropagation(); setEditingCategory(category); setIsAddCategoryDialogOpen(true); }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive bg-accent" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: "category", id: category.id }); }}>
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
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant={item.isActive ? 'default' : 'destructive'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl">{item.name}</h3>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(item.categoryId)}
                      </Badge>
                      {item.subCategoryId && (
                        <Badge variant="outline" className="text-xs">
                          {getSubCategoryName(item.subCategoryId)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-4 w-4"onClick={() => handleEditMenuItem(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-4 w-4 text-destructive"onClick={() => setDeleteConfirm({ type: 'item', id: item.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{item.currencySymbol || '$'}{item.price}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <Star className="absolute inset-0 text-muted-foreground w-4 h-4" />
                      <div className="absolute inset-0 overflow-hidden" style={{ width: `${(item.averageRating / 5) * 100}%` }} >
                        <Star className="text-warning fill-warning w-4 h-4" />
                      </div>
                    </div>
                    <span className="font-medium text-base">{item.averageRating ? item.averageRating.toFixed(1) : "0.0"}</span>
                    <span className="text-muted-foreground text-xs">({item.totalRatings || 0})</span>
                  </div>
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
                    <th className="p-4 font-medium">Sub Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Stock</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3 w-80">
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
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{getCategoryName(item.categoryId)}</Badge>
                      </td>
                      <td className="p-4">
                        {item.subCategoryId && (
                          <Badge variant="outline">{getSubCategoryName(item.subCategoryId)}</Badge>
                        )}
                      </td>
                      <td className="p-4 font-semibold">{item.currencySymbol || '₹'}{item.price}</td>
                      <td className="p-4">{item.stockAvailable ?? "N/A"}</td>
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
                        <div className="flex gap-1">
                          <Badge variant={item.isAvailable ? 'default' : 'secondary'} className="text-xs">
                            {item.isAvailable ? 'Avail' : 'Out'}
                          </Badge>
                          <Badge variant={item.isActive ? 'default' : 'destructive'} className="text-xs">
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
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

  const handleSubmit = async (e: React.FormEvent) => {  // <-- async here
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

    try {
      if (category) {
        await updateCategory(category.id, {
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
        await addCategory({
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
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
        <Label htmlFor="cat-order">Display Order *</Label>
        <Input 
          id="cat-order" 
          type="number" 
          placeholder="0"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          required
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

function SubCategoryForm({ subCategory, onClose }: { subCategory?: SubCategory | null, onClose: () => void }) {
  const { categories, subCategories, addSubCategory, updateSubCategory } = useData();
  const [categoryId, setCategoryId] = useState(subCategory?.categoryId || '');
  const [name, setName] = useState(subCategory?.name || '');
  const [description, setDescription] = useState(subCategory?.description || '');
  const [isActive, setIsActive] = useState(subCategory?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(subCategory?.displayOrder || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !categoryId) {
      toast({
        title: "Error",
        description: "Subcategory name and main category are required",
        variant: "destructive",
      });
      return;
    }

    const duplicate = subCategories.find(
      subCat => subCat.name.toLowerCase() === name.toLowerCase() && 
      subCat.categoryId === categoryId &&
      subCat.id !== subCategory?.id
    );
    
    if (duplicate) {
      toast({
        title: "Error",
        description: "A subcategory with this name already exists in this category",
        variant: "destructive",
      });
      return;
    }

    if (subCategory) {
      updateSubCategory(subCategory.id, {
        categoryId,
        name: name.trim(),
        description: description.trim(),
        isActive,
        displayOrder,
      });
      toast({
        title: "Success",
        description: "Subcategory updated successfully",
      });
    } else {
      addSubCategory({
        categoryId,
        name: name.trim(),
        description: description.trim(),
        isActive,
        displayOrder,
      });
      toast({
        title: "Success",
        description: "Subcategory added successfully",
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="main-category">Main Category *</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select main category" />
          </SelectTrigger>
          <SelectContent>
            {categories.filter((category: any ) => category.is_active).map((category: any) => (
              <SelectItem key={category.id} value={String(category.id)}> {category.name} </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subcat-name">Sub Category Name *</Label>
        <Input 
          id="subcat-name" 
          placeholder="Enter subcategory name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
      </div>

      <div>
        <Label htmlFor="subcat-description">Description</Label>
        <Textarea 
          id="subcat-description" 
          placeholder="Describe the subcategory"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="subcat-order">Display Order *</Label>
        <Input 
          id="subcat-order" 
          type="number" 
          placeholder="0"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="subcat-active">Active Status</Label>
        <Switch 
          id="subcat-active" 
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {subCategory ? 'Update' : 'Add'} Subcategory
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

function MenuItemForm({ menuItem, onClose }: { menuItem?: MenuItem | null, onClose: () => void }) {
  const { categories, subCategories, addMenuItem, updateMenuItem, variantChoices, unitChoices, currencyChoices } = useData();
  const [name, setName] = useState(menuItem?.name || '');
  const [categoryId, setCategoryId] = useState(menuItem?.categoryId || '');
  const [subCategoryId, setSubCategoryId] = useState(menuItem?.subCategoryId || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [price, setPrice] = useState(menuItem?.price?.toString() || '');
  const [prepTime, setPrepTime] = useState(menuItem?.prepTime?.toString() || '');
  const [isAvailable, setIsAvailable] = useState(menuItem?.isAvailable ?? true);
  const [isActive, setIsActive] = useState(menuItem?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(menuItem?.isFeatured ?? false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(menuItem?.image || '');
  const [image, setImage] = useState(menuItem?.image || '');
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [variantType, setVariantType] = useState(menuItem?.variantType || '');
  const [quantityValue, setQuantityValue] = useState(menuItem?.quantityValue?.toString() || '1');
  const [quantityUnit, setQuantityUnit] = useState(menuItem?.quantityUnit || 'item');
  const [currencySymbol, setCurrencySymbol] = useState(menuItem?.currencySymbol || '$');
  const [taxPercentage, setTaxPercentage] = useState(menuItem?.taxPercentage?.toString() || '0.00');
  const [stockAvailable, setStockAvailable] = useState(menuItem?.stockAvailable?.toString() || '0');
  const [maxOrderQuantity, setMaxOrderQuantity] = useState(menuItem?.maxOrderQuantity?.toString() || '');
  const [displayOrder, setDisplayOrder] = useState(menuItem?.displayOrder?.toString() || '0');

  const filteredSubCategories = useMemo(() => {
    return subCategories.filter((sub: any) => {
      const mainCat = sub.categoryId ?? (sub.main_category !== undefined ? String(sub.main_category) : undefined);
      return mainCat === categoryId && sub.is_active;
    });
  }, [categoryId, subCategories]);

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setSubCategoryId('');
  };

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    return file;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !categoryId || !description.trim() || !price) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid price", variant: "destructive" });
      return;
    }

    try {
      const itemData: any = {
        name: name.trim(),
        categoryId,
        subCategoryId: subCategoryId || null,
        description: description.trim(),
        price: priceNum,
        prepTime: prepTime ? parseInt(prepTime) : 0,
        isAvailable,
        isActive,
        isFeatured,
        variantType,
        quantityValue: quantityValue ? parseFloat(quantityValue) : 1,
        quantityUnit,
        currencySymbol,
        taxPercentage: taxPercentage ? parseFloat(taxPercentage) : 0,
        stockAvailable: stockAvailable ? parseInt(stockAvailable) : 0,
        maxOrderQuantity: maxOrderQuantity ? parseInt(maxOrderQuantity) : null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      };

      if (imageFile) {
        itemData.image = imageFile;
      } else if (menuItem?.image) {
        itemData.image = menuItem.image;
      }

      if (menuItem) {
        await updateMenuItem(menuItem.id, itemData);
        toast({ title: "Success", description: "Menu item updated successfully" });
      } else {
        await addMenuItem(itemData);
        toast({ title: "Success", description: "Menu item added successfully" });
      }

      onClose();
    } catch (error) {
      console.error("❌ Image upload or submit failed:", error);
      toast({ title: "Error", description: "Something went wrong while saving the item", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (menuItem && String(menuItem.categoryId) === String(categoryId)) {
      return;
    }
    setSubCategoryId('');
  }, [categoryId, menuItem]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Image Section */}
      <div className="space-y-2">
        <Label htmlFor="image" className="text-sm font-semibold text-gray-700"> Product Image </Label>
        <div className="relative">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-6 cursor-pointer"
            onClick={() => document.getElementById("imageInput")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) { const url = URL.createObjectURL(file); setImageFile(file); setImagePreview(url); setImage(url); }
            }}
          >
            {imagePreview ? (
              <div className="relative group">
                <img src={imagePreview} alt="Preview" className="mx-auto h-44 w-auto rounded-xl object-cover shadow-md group-hover:opacity-90 transition" />
                <button type="button" className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition" onClick={(e) => { e.stopPropagation(); setImage(""); setImagePreview(""); setImageFile(null); setIsImageDeleted(true); }} > ✕ Remove </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <div className="bg-gray-200 rounded-full p-3 mb-2"> 📁 </div>
                <p className="text-sm font-medium">Drop image here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG up to 5MB</p>
              </div>
            )}
          </div>
          <input id="imageInput" type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { const url = URL.createObjectURL(file); setImageFile(file); setImagePreview(url); setImage(url); }
            }}
          />
        </div>
        <div className="relative">
          <Input placeholder="Or paste image URL..." value={image}
            onChange={(e) => { setImage(e.target.value); setImagePreview(e.target.value); }}
            className="pr-10 rounded-xl"
          />
          {image && (
            <button type="button" className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition" onClick={() => { setImage(""); setImagePreview(""); setImageFile(null); setIsImageDeleted(true); }} > ✕ </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="variant">Variant Type</Label>
          <Select value={variantType} onValueChange={setVariantType}>
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {variantChoices.map((variant) => (
                <SelectItem key={variant.value} value={variant.value}>
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea 
          id="description" 
          placeholder="Describe the item"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Main Category *</Label>
          <Select value={categoryId} onValueChange={handleCategoryChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.filter((cat: any) => cat.is_active).map((cat: any) => (
                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="subcategory">Sub Category</Label>
          <Select 
            value={subCategoryId} 
            onValueChange={setSubCategoryId}
            disabled={!categoryId || filteredSubCategories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubCategories.map((subCat: any) => (
                <SelectItem key={subCat.id} value={String(subCat.id)}>{subCat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="currency">Currency *</Label>
          <Select value={currencySymbol} onValueChange={setCurrencySymbol}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencyChoices.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price *</Label>
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
          <Label htmlFor="tax">Tax Percentage</Label>
          <Input 
            id="tax" 
            type="number" 
            step="0.01"
            placeholder="0.00"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantity-val">Quantity Value</Label>
          <Input 
            id="quantity-val" 
            type="number"
            step="0.01"
            placeholder="1"
            value={quantityValue}
            onChange={(e) => setQuantityValue(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="quantity-unit">Quantity Unit *</Label>
          <Select value={quantityUnit} onValueChange={setQuantityUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {unitChoices.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="stock">Stock Available</Label>
          <Input 
            id="stock" 
            type="number" 
            placeholder="0"
            value={stockAvailable}
            onChange={(e) => setStockAvailable(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="max-order">Max Order Qty</Label>
          <Input 
            id="max-order" 
            type="number" 
            placeholder="No limit"
            value={maxOrderQuantity}
            onChange={(e) => setMaxOrderQuantity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="display-order">Display Order *</Label>
          <Input 
            id="display-order" 
            type="number" 
            placeholder="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="active">Product Active</Label>
          <Switch 
            id="active" 
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="available">Availability</Label>
          <Switch 
            id="available" 
            checked={isAvailable}
            onCheckedChange={setIsAvailable}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="featured">Featured</Label>
          <Switch 
            id="featured" 
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
          />
        </div>
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
