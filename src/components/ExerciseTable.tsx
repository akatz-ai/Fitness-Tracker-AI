'use client'

import { useState } from 'react'
import { Exercise } from '@/types/database'

interface ExerciseTableProps {
  exercises: Exercise[]
  onAdd: (exercise: Omit<Exercise, 'id' | 'workout_id' | 'created_at'>) => void
  onUpdate: (exerciseId: string, updates: Partial<Exercise>) => void
  onDelete: (exerciseId: string) => void
}

export function ExerciseTable({ exercises, onAdd, onUpdate, onDelete }: ExerciseTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [showAddRow, setShowAddRow] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: 8,
    weight: '' as string | number,
  })

  const handleCellEdit = (exerciseId: string, field: string, value: string | number | null) => {
    if (field === 'name' && typeof value === 'string' && !value.trim()) return
    onUpdate(exerciseId, { [field]: value })
    setEditingCell(null)
  }

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return

    onAdd({
      name: newExercise.name.trim(),
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight === '' ? null : Number(newExercise.weight),
      order: exercises.length,
    })

    setNewExercise({ name: '', sets: 3, reps: 8, weight: '' })
    setShowAddRow(false)
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-dark-bg text-xs font-medium text-gray-500 uppercase">
        <div className="col-span-5">Exercise</div>
        <div className="col-span-2 text-center">Sets</div>
        <div className="col-span-2 text-center">Reps</div>
        <div className="col-span-2 text-center">Wt (lbs)</div>
        <div className="col-span-1"></div>
      </div>

      {/* Exercise Rows */}
      {exercises.length === 0 && !showAddRow ? (
        <div className="px-4 py-8 text-center text-gray-500">
          No exercises yet. Add one below or use the AI chat.
        </div>
      ) : (
        <div className="divide-y divide-dark-border">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-dark-hover transition-colors"
            >
              {/* Exercise Name */}
              <div className="col-span-5">
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
                    className="text-left text-sm text-white hover:text-blue-400 transition-colors"
                  >
                    {exercise.name}
                  </button>
                )}
              </div>

              {/* Sets */}
              <div className="col-span-2 text-center">
                {editingCell?.id === exercise.id && editingCell.field === 'sets' ? (
                  <input
                    type="number"
                    defaultValue={exercise.sets}
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
                    {exercise.sets}
                  </button>
                )}
              </div>

              {/* Reps */}
              <div className="col-span-2 text-center">
                {editingCell?.id === exercise.id && editingCell.field === 'reps' ? (
                  <input
                    type="number"
                    defaultValue={exercise.reps}
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
                    {exercise.reps}
                  </button>
                )}
              </div>

              {/* Weight */}
              <div className="col-span-2 text-center">
                {editingCell?.id === exercise.id && editingCell.field === 'weight' ? (
                  <input
                    type="number"
                    defaultValue={exercise.weight || ''}
                    autoFocus
                    min={0}
                    onBlur={(e) =>
                      handleCellEdit(
                        exercise.id,
                        'weight',
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        handleCellEdit(
                          exercise.id,
                          'weight',
                          e.currentTarget.value ? parseInt(e.currentTarget.value) : null
                        )
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
          ))}
        </div>
      )}

      {/* Add Row Form */}
      {showAddRow && (
        <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-t border-dark-border bg-dark-bg/50">
          <div className="col-span-5">
            <input
              type="text"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              placeholder="Exercise name"
              autoFocus
              className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddExercise()
                if (e.key === 'Escape') setShowAddRow(false)
              }}
            />
          </div>
          <div className="col-span-2">
            <input
              type="number"
              value={newExercise.sets}
              onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
              min={1}
              className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-500"
            />
          </div>
          <div className="col-span-2">
            <input
              type="number"
              value={newExercise.reps}
              onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 1 })}
              min={1}
              className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-500"
            />
          </div>
          <div className="col-span-2">
            <input
              type="number"
              value={newExercise.weight}
              onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
              min={0}
              placeholder="-"
              className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-500"
            />
          </div>
          <div className="col-span-1 flex gap-1">
            <button
              onClick={handleAddExercise}
              className="p-1 text-green-500 hover:text-green-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
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
