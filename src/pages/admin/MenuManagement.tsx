import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Star, FolderPlus, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { MenuItem, Category, Subcategory } from '@/types';

export default function MenuManagement() {
  const { 
    categories, 
    subcategories, 
    menuItems, 
    deleteCategory, 
    deleteSubcategory, 
    deleteMenuItem 
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddSubcategoryDialogOpen, setIsAddSubcategoryDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'subcategory' | 'item', id: string } | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'category') {
      const subcatsInCategory = subcategories.filter(sub => sub.categoryId === deleteConfirm.id);
      const itemsInCategory = menuItems.filter(item => item.categoryId === deleteConfirm.id);
      
      if (subcatsInCategory.length > 0 || itemsInCategory.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This category has subcategories or items. Please delete them first.",
          variant: "destructive",
        });
        setDeleteConfirm(null);
        return;
      }
      deleteCategory(deleteConfirm.id);
      toast({ title: "Success", description: "Category deleted successfully" });
    } else if (deleteConfirm.type === 'subcategory') {
      const itemsInSubcategory = menuItems.filter(item => item.subcategoryId === deleteConfirm.id);
      
      if (itemsInSubcategory.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This subcategory has menu items. Please delete or reassign items first.",
          variant: "destructive",
        });
        setDeleteConfirm(null);
        return;
      }
      deleteSubcategory(deleteConfirm.id);
      toast({ title: "Success", description: "Subcategory deleted successfully" });
    } else {
      deleteMenuItem(deleteConfirm.id);
      toast({ title: "Success", description: "Menu item deleted successfully" });
    }
    setDeleteConfirm(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddCategoryDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSelectedCategoryForSubcategory(subcategory.categoryId);
    setIsAddSubcategoryDialogOpen(true);
  };

  const handleAddSubcategory = (categoryId: string) => {
    setSelectedCategoryForSubcategory(categoryId);
    setEditingSubcategory(null);
    setIsAddSubcategoryDialogOpen(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsAddItemDialogOpen(true);
  };

  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  const getCategorySubcategories = (categoryId: string) => {
    return subcategories
      .filter(sub => sub.categoryId === categoryId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const getSubcategoryItems = (subcategoryId: string) => {
    return menuItems
      .filter(item => item.subcategoryId === subcategoryId && 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const getCategoryItems = (categoryId: string) => {
    return menuItems
      .filter(item => item.categoryId === categoryId && !item.subcategoryId && 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage categories, subcategories, and menu items</p>
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories with Subcategories */}
      <div className="space-y-4">
        {sortedCategories.map(category => {
          const categorySubcategories = getCategorySubcategories(category.id);
          const directItems = getCategoryItems(category.id);
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <Card key={category.id}>
              <CardContent className="p-0">
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                  <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-3 flex-1">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <Badge variant={category.isActive ? 'default' : 'secondary'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSubcategory(category.id)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Subcategory
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteConfirm({ type: 'category', id: category.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="p-4 space-y-4">
                      {/* Direct Items (no subcategory) */}
                      {directItems.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Items without subcategory</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {directItems.map(item => (
                                <MenuItemRow 
                                  key={item.id} 
                                  item={item} 
                                  onEdit={handleEditMenuItem}
                                  onDelete={(id) => setDeleteConfirm({ type: 'item', id })}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Subcategories */}
                      {categorySubcategories.map(subcategory => {
                        const subcategoryItems = getSubcategoryItems(subcategory.id);
                        
                        return (
                          <div key={subcategory.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{subcategory.name}</h4>
                                <Badge variant={subcategory.isActive ? 'default' : 'secondary'} className="text-xs">
                                  {subcategory.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditSubcategory(subcategory)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => setDeleteConfirm({ type: 'subcategory', id: subcategory.id })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{subcategory.description}</p>

                            {/* Items in Subcategory */}
                            {subcategoryItems.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {subcategoryItems.map(item => (
                                    <MenuItemRow 
                                      key={item.id} 
                                      item={item} 
                                      onEdit={handleEditMenuItem}
                                      onDelete={(id) => setDeleteConfirm({ type: 'item', id })}
                                    />
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">No items in this subcategory</p>
                            )}
                          </div>
                        );
                      })}

                      {categorySubcategories.length === 0 && directItems.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No subcategories or items yet. Add a subcategory or menu item to get started.
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subcategory Dialog */}
      <Dialog open={isAddSubcategoryDialogOpen} onOpenChange={(open) => {
        setIsAddSubcategoryDialogOpen(open);
        if (!open) {
          setEditingSubcategory(null);
          setSelectedCategoryForSubcategory('');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
          </DialogHeader>
          <SubcategoryForm 
            subcategory={editingSubcategory}
            preSelectedCategoryId={selectedCategoryForSubcategory}
            onClose={() => {
              setIsAddSubcategoryDialogOpen(false);
              setEditingSubcategory(null);
              setSelectedCategoryForSubcategory('');
            }} 
          />
        </DialogContent>
      </Dialog>

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

function MenuItemRow({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-muted flex-shrink-0">
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
            {item.isFeatured && <Badge variant="outline" className="text-xs mt-1">Featured</Badge>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
      </TableCell>
      <TableCell className="font-semibold">₹{item.price}</TableCell>
      <TableCell>
        <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
          {item.isAvailable ? 'Available' : 'Out of Stock'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
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

function SubcategoryForm({ 
  subcategory, 
  preSelectedCategoryId,
  onClose 
}: { 
  subcategory?: Subcategory | null;
  preSelectedCategoryId?: string;
  onClose: () => void;
}) {
  const { categories, subcategories, addSubcategory, updateSubcategory } = useData();
  const [categoryId, setCategoryId] = useState(subcategory?.categoryId || preSelectedCategoryId || '');
  const [name, setName] = useState(subcategory?.name || '');
  const [description, setDescription] = useState(subcategory?.description || '');
  const [isActive, setIsActive] = useState(subcategory?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(subcategory?.displayOrder || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !categoryId) {
      toast({
        title: "Error",
        description: "Subcategory name and category are required",
        variant: "destructive",
      });
      return;
    }

    const duplicate = subcategories.find(
      sub => sub.name.toLowerCase() === name.toLowerCase() && 
             sub.categoryId === categoryId && 
             sub.id !== subcategory?.id
    );
    
    if (duplicate) {
      toast({
        title: "Error",
        description: "A subcategory with this name already exists in this category",
        variant: "destructive",
      });
      return;
    }

    if (subcategory) {
      updateSubcategory(subcategory.id, {
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
      addSubcategory({
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
        <Label htmlFor="subcat-category">Category *</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required disabled={!!preSelectedCategoryId}>
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
        <Label htmlFor="subcat-name">Subcategory Name *</Label>
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
          {subcategory ? 'Update' : 'Add'} Subcategory
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

function MenuItemForm({ menuItem, onClose }: { menuItem?: MenuItem | null, onClose: () => void }) {
  const { categories, subcategories, addMenuItem, updateMenuItem } = useData();
  const [name, setName] = useState(menuItem?.name || '');
  const [categoryId, setCategoryId] = useState(menuItem?.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(menuItem?.subcategoryId || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [price, setPrice] = useState(menuItem?.price?.toString() || '');
  const [prepTime, setPrepTime] = useState(menuItem?.prepTime?.toString() || '');
  const [isAvailable, setIsAvailable] = useState(menuItem?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(menuItem?.isFeatured ?? false);
  const [image, setImage] = useState(menuItem?.image || '');
  const [displayOrder, setDisplayOrder] = useState(menuItem?.displayOrder || 0);

  const filteredSubcategories = subcategories.filter(sub => sub.categoryId === categoryId && sub.isActive);

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setSubcategoryId(''); // Reset subcategory when category changes
  };
  
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
      subcategoryId: subcategoryId || undefined,
      description: description.trim(),
      price: priceNum,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      isAvailable,
      isFeatured,
      image: image.trim() || undefined,
      displayOrder,
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={categoryId} onValueChange={handleCategoryChange} required>
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
          <Label htmlFor="subcategory">Subcategory (Optional)</Label>
          <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId || filteredSubcategories.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {filteredSubcategories.map(sub => (
                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryId && filteredSubcategories.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">No subcategories available for this category</p>
          )}
        </div>
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

      <div className="grid grid-cols-3 gap-4">
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
        <div>
          <Label htmlFor="displayOrder">Display Order *</Label>
          <Input 
            id="displayOrder" 
            type="number" 
            placeholder="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            required
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
