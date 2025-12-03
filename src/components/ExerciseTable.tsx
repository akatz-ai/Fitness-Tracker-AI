'use client'

import { useState } from 'react'
import { Exercise, ExerciseUnit } from '@/types/database'

interface ExerciseTableProps {
  exercises: Exercise[]
  onAdd: (exercise: Omit<Exercise, 'id' | 'workout_id' | 'created_at'>) => void
  onUpdate: (exerciseId: string, updates: Partial<Exercise>) => void
  onDelete: (exerciseId: string) => void
}

const unitLabels: Record<ExerciseUnit, string> = {
  lbs: 'lbs',
  kg: 'kg',
  min: 'min',
  sec: 'sec',
  miles: 'mi',
  km: 'km',
  cal: 'cal',
  bodyweight: 'BW',
}

const unitOptions: { value: ExerciseUnit; label: string }[] = [
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'min', label: 'Minutes' },
  { value: 'sec', label: 'Seconds' },
  { value: 'miles', label: 'Miles' },
  { value: 'km', label: 'Kilometers' },
  { value: 'cal', label: 'Calories' },
  { value: 'bodyweight', label: 'Bodyweight' },
]

// Determine if exercise type uses sets/reps or just a value
const isCardioUnit = (unit: ExerciseUnit) => ['min', 'sec', 'miles', 'km', 'cal'].includes(unit)

export function ExerciseTable({ exercises, onAdd, onUpdate, onDelete }: ExerciseTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [showAddRow, setShowAddRow] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3 as number | null,
    reps: 8 as number | null,
    weight: '' as string | number,
    unit: 'lbs' as ExerciseUnit,
  })

  const handleCellEdit = (exerciseId: string, field: string, value: string | number | null) => {
    if (field === 'name' && typeof value === 'string' && !value.trim()) return
    onUpdate(exerciseId, { [field]: value })
    setEditingCell(null)
  }

  const handleUnitChange = (exerciseId: string, newUnit: ExerciseUnit) => {
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    // When switching to cardio, clear sets/reps; when switching to weights, set defaults
    if (isCardioUnit(newUnit) && !isCardioUnit(exercise.unit)) {
      onUpdate(exerciseId, { unit: newUnit, sets: null, reps: null })
    } else if (!isCardioUnit(newUnit) && isCardioUnit(exercise.unit)) {
      onUpdate(exerciseId, { unit: newUnit, sets: 3, reps: 8 })
    } else {
      onUpdate(exerciseId, { unit: newUnit })
    }
    setEditingCell(null)
  }

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return

    const isCardio = isCardioUnit(newExercise.unit)

    onAdd({
      name: newExercise.name.trim(),
      sets: isCardio ? null : (newExercise.sets || 3),
      reps: isCardio ? null : (newExercise.reps || 8),
      weight: newExercise.weight === '' ? null : Number(newExercise.weight),
      unit: newExercise.unit,
      order: exercises.length,
    })

    setNewExercise({ name: '', sets: 3, reps: 8, weight: '', unit: 'lbs' })
    setShowAddRow(false)
  }

  const renderExerciseRow = (exercise: Exercise) => {
    const isCardio = isCardioUnit(exercise.unit)
    const unit = exercise.unit || 'lbs'

    return (
      <div
        key={exercise.id}
        className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-dark-hover transition-colors"
      >
        {/* Exercise Name */}
        <div className={isCardio ? 'col-span-5' : 'col-span-4'}>
          {editingCell?.id === exercise.id && editingCell.field === 'name' ? (
            <input
              type="text"
              defaultValue={exercise.name}
              autoFocus
              onBlur={(e) => handleCellEdit(exercise.id, 'name', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCellEdit(exercise.id, 'name', e.currentTarget.value)
                if (e.key === 'Escape') setEditingCell(null)
              }}
              className="w-full bg-dark-bg border border-blue-500 rounded px-2 py-1 text-sm outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingCell({ id: exercise.id, field: 'name' })}
              className="text-left text-sm text-white hover:text-blue-400 transition-colors truncate block w-full"
            >
              {exercise.name}
            </button>
          )}
        </div>

        {isCardio ? (
          // Cardio layout: Name | Value | Unit | Delete
          <>
            {/* Value (duration/distance) */}
            <div className="col-span-3 text-center">
              {editingCell?.id === exercise.id && editingCell.field === 'weight' ? (
                <input
                  type="number"
                  defaultValue={exercise.weight || ''}
                  autoFocus
                  min={0}
                  onBlur={(e) =>
                    handleCellEdit(exercise.id, 'weight', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      handleCellEdit(exercise.id, 'weight', e.currentTarget.value ? parseFloat(e.currentTarget.value) : null)
                    if (e.key === 'Escape') setEditingCell(null)
                  }}
                  className="w-full bg-dark-bg border border-blue-500 rounded px-2 py-1 text-sm text-center outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingCell({ id: exercise.id, field: 'weight' })}
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {exercise.weight ?? '-'}
                </button>
              )}
            </div>

            {/* Unit selector */}
            <div className="col-span-3 text-center">
              {editingCell?.id === exercise.id && editingCell.field === 'unit' ? (
                <select
                  value={unit}
                  autoFocus
                  onChange={(e) => handleUnitChange(exercise.id, e.target.value as ExerciseUnit)}
                  onBlur={() => setEditingCell(null)}
                  className="w-full bg-dark-bg border border-blue-500 rounded px-1 py-1 text-sm text-center outline-none"
                >
                  {unitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditingCell({ id: exercise.id, field: 'unit' })}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-2 py-0.5 bg-blue-500/10 rounded"
                >
                  {unitLabels[unit]}
                </button>
              )}
            </div>
          </>
        ) : (
          // Weight training layout: Name | Sets | Reps | Weight+Unit | Delete
          <>
            {/* Sets */}
            <div className="col-span-2 text-center">
              {editingCell?.id === exercise.id && editingCell.field === 'sets' ? (
                <input
                  type="number"
                  defaultValue={exercise.sets || ''}
                  autoFocus
                  min={1}
                  onBlur={(e) => handleCellEdit(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCellEdit(exercise.id, 'sets', parseInt(e.currentTarget.value) || 1)
                    if (e.key === 'Escape') setEditingCell(null)
                  }}
                  className="w-full bg-dark-bg border border-blue-500 rounded px-2 py-1 text-sm text-center outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingCell({ id: exercise.id, field: 'sets' })}
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {exercise.sets ?? '-'}
                </button>
              )}
            </div>

            {/* Reps */}
            <div className="col-span-2 text-center">
              {editingCell?.id === exercise.id && editingCell.field === 'reps' ? (
                <input
                  type="number"
                  defaultValue={exercise.reps || ''}
                  autoFocus
                  min={1}
                  onBlur={(e) => handleCellEdit(exercise.id, 'reps', parseInt(e.target.value) || 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCellEdit(exercise.id, 'reps', parseInt(e.currentTarget.value) || 1)
                    if (e.key === 'Escape') setEditingCell(null)
                  }}
                  className="w-full bg-dark-bg border border-blue-500 rounded px-2 py-1 text-sm text-center outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingCell({ id: exercise.id, field: 'reps' })}
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {exercise.reps ?? '-'}
                </button>
              )}
            </div>

            {/* Weight + Unit */}
            <div className="col-span-3 text-center flex items-center justify-center gap-1">
              {editingCell?.id === exercise.id && editingCell.field === 'weight' ? (
                <input
                  type="number"
                  defaultValue={exercise.weight || ''}
                  autoFocus
                  min={0}
                  onBlur={(e) =>
                    handleCellEdit(exercise.id, 'weight', e.target.value ? parseInt(e.target.value) : null)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      handleCellEdit(exercise.id, 'weight', e.currentTarget.value ? parseInt(e.currentTarget.value) : null)
                    if (e.key === 'Escape') setEditingCell(null)
                  }}
                  className="w-16 bg-dark-bg border border-blue-500 rounded px-2 py-1 text-sm text-center outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingCell({ id: exercise.id, field: 'weight' })}
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {exercise.weight ?? '-'}
                </button>
              )}
              {editingCell?.id === exercise.id && editingCell.field === 'unit' ? (
                <select
                  value={unit}
                  autoFocus
                  onChange={(e) => handleUnitChange(exercise.id, e.target.value as ExerciseUnit)}
                  onBlur={() => setEditingCell(null)}
                  className="bg-dark-bg border border-blue-500 rounded px-1 py-1 text-xs outline-none"
                >
                  {unitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditingCell({ id: exercise.id, field: 'unit' })}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-1.5 py-0.5 bg-blue-500/10 rounded"
                >
                  {unitLabels[unit]}
                </button>
              )}
            </div>
          </>
        )}

        {/* Delete button */}
        <div className="col-span-1 text-right">
          <button
            onClick={() => onDelete(exercise.id)}
            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  const isNewCardio = isCardioUnit(newExercise.unit)

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-dark-bg text-xs font-medium text-gray-500 uppercase">
        <div className="col-span-4">Exercise</div>
        <div className="col-span-2 text-center">Sets</div>
        <div className="col-span-2 text-center">Reps</div>
        <div className="col-span-3 text-center">Value</div>
        <div className="col-span-1"></div>
      </div>

      {/* Exercise Rows */}
      {exercises.length === 0 && !showAddRow ? (
        <div className="px-4 py-8 text-center text-gray-500">
          No exercises yet. Add one below or use the AI chat.
        </div>
      ) : (
        <div className="divide-y divide-dark-border">
          {exercises.map(renderExerciseRow)}
        </div>
      )}

      {/* Add Row Form */}
      {showAddRow && (
        <div className="px-4 py-3 border-t border-dark-border bg-dark-bg/50">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className={isNewCardio ? 'col-span-5' : 'col-span-4'}>
              <input
                type="text"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="Exercise name"
                autoFocus
                className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddExercise()
                  if (e.key === 'Escape') setShowAddRow(false)
                }}
              />
            </div>

            {isNewCardio ? (
              <>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                    min={0}
                    placeholder="Value"
                    className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-sm text-center outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={newExercise.unit}
                    onChange={(e) => setNewExercise({ ...newExercise, unit: e.target.value as ExerciseUnit })}
                    className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                  >
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={newExercise.sets || ''}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || null })}
                    min={1}
                    placeholder="Sets"
                    className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-sm text-center outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={newExercise.reps || ''}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || null })}
                    min={1}
                    placeholder="Reps"
                    className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-sm text-center outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-3 flex gap-1">
                  <input
                    type="number"
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                    min={0}
                    placeholder="Wt"
                    className="w-16 bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-sm text-center outline-none focus:border-blue-500"
                  />
                  <select
                    value={newExercise.unit}
                    onChange={(e) => setNewExercise({ ...newExercise, unit: e.target.value as ExerciseUnit })}
                    className="flex-1 bg-dark-bg border border-dark-border rounded px-1 py-1.5 text-xs outline-none focus:border-blue-500"
                  >
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="col-span-1 flex gap-1 justify-end">
              <button
                onClick={handleAddExercise}
                className="p-1.5 text-green-500 hover:text-green-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => setShowAddRow(false)}
                className="p-1.5 text-gray-500 hover:text-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Button */}
      <button
        onClick={() => setShowAddRow(true)}
        className="w-full px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-dark-hover transition-colors flex items-center justify-center gap-2 border-t border-dark-border"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Exercise
      </button>
    </div>
  )
}
