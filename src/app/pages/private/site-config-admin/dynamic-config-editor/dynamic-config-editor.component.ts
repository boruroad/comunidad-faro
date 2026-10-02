import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ConfigFieldSchema, createEmptyItem } from '../config-schema';

// Editor recursivo generico: dado un schema (ver config-schema.ts) y un
// objeto de valores, dibuja una tabla de propiedades editable (sin JSON
// crudo). Soporta campos escalares, objetos anidados de forma fija,
// listas de objetos (agregar/quitar/mover filas), mapas clave-valor
// (ej. socials) y listas de pares (ej. firstVisit).
@Component({
  selector: 'app-dynamic-config-editor',
  standalone: true,
  imports: [DynamicConfigEditorComponent],
  templateUrl: './dynamic-config-editor.component.html'
})
export class DynamicConfigEditorComponent {
  @Input() schema: ConfigFieldSchema[] = [];
  @Input() value: Record<string, unknown> = {};
  @Input() depth = 0;
  @Output() readonly valueChange = new EventEmitter<Record<string, unknown>>();

  // Buffer local del nombre de la nueva propiedad para cada campo tipo "map".
  readonly newMapKey: Record<string, string> = {};

  getScalar(field: ConfigFieldSchema): string {
    const raw = this.value ? this.value[field.key] : undefined;
    return raw === undefined || raw === null ? '' : String(raw);
  }

  getBoolean(field: ConfigFieldSchema): boolean {
    return Boolean(this.value ? this.value[field.key] : false);
  }

  getObjectValue(field: ConfigFieldSchema): Record<string, unknown> {
    const raw = this.value ? this.value[field.key] : undefined;
    return raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  }

  getListValue(field: ConfigFieldSchema): Record<string, unknown>[] {
    const raw = this.value ? this.value[field.key] : undefined;
    return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  }

  getMapEntries(field: ConfigFieldSchema): Array<[string, string]> {
    const raw = this.getObjectValue(field);
    return Object.entries(raw).map(([key, val]) => [
      key,
      val === undefined || val === null ? '' : String(val)
    ]);
  }

  getTupleEntries(field: ConfigFieldSchema): string[][] {
    const raw = this.value ? this.value[field.key] : undefined;
    if (!Array.isArray(raw)) {
      return [];
    }

    return (raw as unknown[]).map(pair =>
      Array.isArray(pair) ? [String(pair[0] ?? ''), String(pair[1] ?? '')] : ['', '']
    );
  }

  itemLabel(field: ConfigFieldSchema, item: Record<string, unknown>, index: number): string {
    const labelKey = field.itemLabelKey;
    const raw = labelKey ? item[labelKey] : undefined;
    const text = raw === undefined || raw === null || raw === '' ? '' : String(raw);

    return text || `Elemento ${index + 1}`;
  }

  updateScalar(field: ConfigFieldSchema, rawValue: string): void {
    const parsedValue = field.type === 'number' ? Number(rawValue) : rawValue;
    this.emitUpdate(field.key, parsedValue);
  }

  updateBoolean(field: ConfigFieldSchema, checked: boolean): void {
    this.emitUpdate(field.key, checked);
  }

  updateObject(field: ConfigFieldSchema, nextValue: Record<string, unknown>): void {
    this.emitUpdate(field.key, nextValue);
  }

  updateListItem(field: ConfigFieldSchema, index: number, nextItem: Record<string, unknown>): void {
    const list = this.getListValue(field).slice();
    list[index] = nextItem;
    this.emitUpdate(field.key, list);
  }

  addListItem(field: ConfigFieldSchema): void {
    const list = this.getListValue(field).slice();
    list.push(field.itemSchema ? createEmptyItem(field.itemSchema) : {});
    this.emitUpdate(field.key, list);
  }

  removeListItem(field: ConfigFieldSchema, index: number): void {
    const list = this.getListValue(field).slice();
    list.splice(index, 1);
    this.emitUpdate(field.key, list);
  }

  moveListItem(field: ConfigFieldSchema, index: number, direction: -1 | 1): void {
    const list = this.getListValue(field).slice();
    const target = index + direction;

    if (target < 0 || target >= list.length) {
      return;
    }

    [list[index], list[target]] = [list[target], list[index]];
    this.emitUpdate(field.key, list);
  }

  updateMapValue(field: ConfigFieldSchema, mapKey: string, newValue: string): void {
    const map = { ...this.getObjectValue(field) };
    map[mapKey] = newValue;
    this.emitUpdate(field.key, map);
  }

  renameMapKey(field: ConfigFieldSchema, oldKey: string, newKey: string): void {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed === oldKey) {
      return;
    }

    const map = { ...this.getObjectValue(field) };
    if (map[trimmed] !== undefined) {
      return;
    }

    map[trimmed] = map[oldKey];
    delete map[oldKey];
    this.emitUpdate(field.key, map);
  }

  removeMapEntry(field: ConfigFieldSchema, mapKey: string): void {
    const map = { ...this.getObjectValue(field) };
    delete map[mapKey];
    this.emitUpdate(field.key, map);
  }

  addMapEntry(field: ConfigFieldSchema): void {
    const newKey = (this.newMapKey[field.key] || '').trim();
    if (!newKey) {
      return;
    }

    const map = { ...this.getObjectValue(field) };
    if (map[newKey] !== undefined) {
      return;
    }

    map[newKey] = '';
    this.newMapKey[field.key] = '';
    this.emitUpdate(field.key, map);
  }

  updateNewMapKey(field: ConfigFieldSchema, newValue: string): void {
    this.newMapKey[field.key] = newValue;
  }

  updateTupleCell(field: ConfigFieldSchema, index: number, column: 0 | 1, newValue: string): void {
    const tuples = this.getTupleEntries(field).map(pair => pair.slice());
    tuples[index][column] = newValue;
    this.emitUpdate(field.key, tuples);
  }

  addTupleRow(field: ConfigFieldSchema): void {
    const tuples = this.getTupleEntries(field).map(pair => pair.slice());
    tuples.push(['', '']);
    this.emitUpdate(field.key, tuples);
  }

  removeTupleRow(field: ConfigFieldSchema, index: number): void {
    const tuples = this.getTupleEntries(field).map(pair => pair.slice());
    tuples.splice(index, 1);
    this.emitUpdate(field.key, tuples);
  }

  private emitUpdate(key: string, newFieldValue: unknown): void {
    const next = { ...(this.value || {}), [key]: newFieldValue };
    this.valueChange.emit(next);
  }
}
