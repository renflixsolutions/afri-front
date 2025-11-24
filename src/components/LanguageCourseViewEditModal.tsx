/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { Save, X, Trash2, ChevronsUpDown, Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LanguageCourse, LanguageCourseBundle } from '@/types/language-courses';

interface Props {
  course: LanguageCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (payload: Partial<LanguageCourse>) => Promise<void>;
}

const CEFR_LEVELS = ['A1','A2','B1','B2','C1','C2'];

export default function LanguageCourseViewEditModal({ course, isOpen, onClose, onSave }: Props) {
  const [mode, setMode] = useState<'view'|'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Partial<LanguageCourse>>({});
  const [bundles, setBundles] = useState<LanguageCourseBundle[]>([]);
  const [levelsOpenIndex, setLevelsOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (course) {
      setForm({
        language: course.language,
        level: course.level,
        title: course.title,
        description: course.description,
        ideal_for: course.ideal_for,
        duration_weeks: course.duration_weeks,
        price: course.price,
      });
      setBundles(course.bundles || []);
      setMode('view');
      setErrors({});
    }
  }, [course]);

  const setField = (key: keyof LanguageCourse, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: Record<string,string> = {};
    if (!form.language?.trim()) e.language = 'Language is required';
    if (!form.level?.trim()) e.level = 'Level is required';
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.description?.trim()) e.description = 'Description is required';
    if (!form.ideal_for?.trim()) e.ideal_for = 'Ideal for is required';
    if (!form.duration_weeks || form.duration_weeks <= 0) e.duration_weeks = 'Duration must be > 0';
    if (form.price == null || form.price < 0) e.price = 'Price must be 	>= 0';
    bundles.forEach((b, i) => {
      if (!b.name?.trim()) e[`bundles.${i}.name`] = 'Name is required';
      if (!b.duration_weeks || b.duration_weeks <= 0) e[`bundles.${i}.duration_weeks`] = 'Duration must be > 0';
      if (b.original_price == null || b.original_price < 0) e[`bundles.${i}.original_price`] = 'Original price must be >= 0';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addBundle = () => setBundles(prev => ([...prev, { name: '', included_levels: [], duration_weeks: 0, original_price: 0, discount_percent: null, discounted_price: null }]));
  const removeBundle = (idx: number) => setBundles(prev => prev.filter((_, i) => i !== idx));
  const updateBundle = (idx: number, patch: Partial<LanguageCourseBundle>) => setBundles(prev => prev.map((b, i) => i === idx ? { ...b, ...patch } : b));
  const toggleIncludedLevel = (idx: number, level: string, checked: boolean) => setBundles(prev => prev.map((b, i) => {
    if (i !== idx) return b; const set = new Set(b.included_levels || []); if (checked) set.add(level); else set.delete(level); return { ...b, included_levels: Array.from(set) };
  }));

  const handleSave = async () => {
    if (!onSave || !course) return;
    if (!validate()) { toast.error('Please correct validation errors'); return; }
    setIsLoading(true);
    try {
      await onSave({ ...form, bundles });
      setMode('view');
    } catch (err: any) {
      const status = err?.response?.status; const serverErrors = err?.response?.data?.errors;
      if (status === 422 && serverErrors) {
        const mapped: Record<string,string> = {};
        Object.entries(serverErrors).forEach(([k, v]: [string, any]) => { mapped[k] = Array.isArray(v) ? v.join(', ') : String(v); });
        setErrors(mapped);
        toast.error('Validation errors occurred');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update course');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{course.title}</DialogTitle>
              <DialogDescription>{mode === 'view' ? 'View course' : 'Edit course'}</DialogDescription>
            </div>
            {mode === 'view' && <Button variant="outline" onClick={() => setMode('edit')}>Edit</Button>}
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language *</Label>
              {mode === 'edit' ? (
                <Input value={form.language || ''} onChange={(e) => setField('language', e.target.value)} className={errors.language ? 'border-red-500' : ''} />
              ) : (
                <div className="text-sm">{course.language}</div>
              )}
              {errors.language && <p className="text-xs text-red-500">{errors.language}</p>}
            </div>
            <div className="space-y-2">
              <Label>Level *</Label>
              {mode === 'edit' ? (
                <Select value={form.level || ''} onValueChange={(v) => setField('level', v)}>
                  <SelectTrigger className={errors.level ? 'border-red-500' : ''}><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>{CEFR_LEVELS.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
                </Select>
              ) : (
                <div className="text-sm">{course.level}</div>
              )}
              {errors.level && <p className="text-xs text-red-500">{errors.level}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            {mode === 'edit' ? (
              <Input value={form.title || ''} onChange={(e) => setField('title', e.target.value)} className={errors.title ? 'border-red-500' : ''} />
            ) : (
              <div className="text-sm">{course.title}</div>
            )}
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              {mode === 'edit' ? (
                <Textarea value={form.description || ''} onChange={(e) => setField('description', e.target.value)} className={errors.description ? 'border-red-500' : ''} rows={4} />
              ) : (
                <div className="text-sm whitespace-pre-wrap">{course.description}</div>
              )}
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ideal For *</Label>
              {mode === 'edit' ? (
                <Textarea value={form.ideal_for || ''} onChange={(e) => setField('ideal_for', e.target.value)} className={errors.ideal_for ? 'border-red-500' : ''} rows={4} />
              ) : (
                <div className="text-sm whitespace-pre-wrap">{course.ideal_for}</div>
              )}
              {errors.ideal_for && <p className="text-xs text-red-500">{errors.ideal_for}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (weeks) *</Label>
              {mode === 'edit' ? (
                <Input type="number" value={form.duration_weeks ?? ''} onChange={(e) => setField('duration_weeks', Number(e.target.value))} className={errors.duration_weeks ? 'border-red-500' : ''} />
              ) : (
                <div className="text-sm">{course.duration_weeks}</div>
              )}
              {errors.duration_weeks && <p className="text-xs text-red-500">{errors.duration_weeks}</p>}
            </div>
            <div className="space-y-2">
              <Label>Price *</Label>
              {mode === 'edit' ? (
                <Input type="number" value={form.price ?? ''} onChange={(e) => setField('price', Number(e.target.value))} className={errors.price ? 'border-red-500' : ''} />
              ) : (
                <div className="text-sm">{course.price.toLocaleString()}</div>
              )}
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>
          </div>

          {/* Bundles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Bundles</Label>
              {mode === 'edit' && <Button type="button" variant="outline" size="sm" onClick={addBundle}><Plus className="h-4 w-4 mr-2" />Add Bundle</Button>}
            </div>
            <div className="space-y-3">
              {(bundles?.length || 0) === 0 && <Card><CardContent className="text-sm text-muted-foreground py-6">No bundles</CardContent></Card>}
              {bundles?.map((b, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Bundle #{idx+1}</div>
                      {mode === 'edit' && (
                        <Button type="button" variant="ghost" className="text-red-600" size="sm" onClick={() => removeBundle(idx)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name {mode === 'edit' && '*'} </Label>
                        {mode === 'edit' ? (
                          <Input value={b.name} onChange={(e) => updateBundle(idx, { name: e.target.value })} className={errors[`bundles.${idx}.name`] ? 'border-red-500' : ''} />
                        ) : (<div className="text-sm">{b.name}</div>)}
                        {errors[`bundles.${idx}.name`] && <p className="text-xs text-red-500">{errors[`bundles.${idx}.name`]}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Duration (weeks) {mode === 'edit' && '*'} </Label>
                        {mode === 'edit' ? (
                          <Input type="number" value={b.duration_weeks ?? ''} onChange={(e) => updateBundle(idx, { duration_weeks: Number(e.target.value) })} className={errors[`bundles.${idx}.duration_weeks`] ? 'border-red-500' : ''} />
                        ) : (<div className="text-sm">{b.duration_weeks}</div>)}
                        {errors[`bundles.${idx}.duration_weeks`] && <p className="text-xs text-red-500">{errors[`bundles.${idx}.duration_weeks`]}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Original Price {mode === 'edit' && '*'} </Label>
                        {mode === 'edit' ? (
                          <Input type="number" value={b.original_price ?? ''} onChange={(e) => updateBundle(idx, { original_price: Number(e.target.value) })} className={errors[`bundles.${idx}.original_price`] ? 'border-red-500' : ''} />
                        ) : (<div className="text-sm">{b.original_price?.toLocaleString?.() ?? b.original_price}</div>)}
                        {errors[`bundles.${idx}.original_price`] && <p className="text-xs text-red-500">{errors[`bundles.${idx}.original_price`]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Discount %</Label>
                        {mode === 'edit' ? (
                          <Input type="number" value={b.discount_percent ?? ''} onChange={(e) => updateBundle(idx, { discount_percent: e.target.value === '' ? null : Number(e.target.value) })} />
                        ) : (<div className="text-sm">{b.discount_percent ?? '-'}</div>)}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Discounted Price</Label>
                        {mode === 'edit' ? (
                          <Input type="number" value={b.discounted_price ?? ''} onChange={(e) => updateBundle(idx, { discounted_price: e.target.value === '' ? null : Number(e.target.value) })} />
                        ) : (<div className="text-sm">{b.discounted_price?.toLocaleString?.() ?? '-'}</div>)}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Included Levels</Label>
                        {mode === 'edit' ? (
                          <Popover open={levelsOpenIndex === idx} onOpenChange={(o) => setLevelsOpenIndex(o ? idx : null)}>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline" className="justify-between">
                                {b.included_levels && b.included_levels.length > 0 ? b.included_levels.join(', ') : 'Select levels'}
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3">
                              <div className="space-y-2">
                                {CEFR_LEVELS.map(level => (
                                  <label key={level} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={b.included_levels?.includes(level) || false}
                                      onCheckedChange={(checked) => toggleIncludedLevel(idx, level, Boolean(checked))}
                                    />
                                    <span className="text-sm">{level}</span>
                                  </label>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="text-sm">{(b.included_levels || []).join(', ') || '-'}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          {mode === 'edit' ? (
            <>
              <Button variant="outline" onClick={() => { if (course) { setMode('view'); setForm({ language: course.language, level: course.level, title: course.title, description: course.description, ideal_for: course.ideal_for, duration_weeks: course.duration_weeks, price: course.price }); setBundles(course.bundles || []); setErrors({}); } }} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />{isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

