"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/apis";
import Modal from "@/components/ui/Modal";
import CourseTabs from "@/components/owner/CourseTabs";
import type { Section as SectionBase, Lecture, Course } from "@/lib/types";

type Section = Omit<SectionBase, "lectures"> & { lectures: Lecture[] };

export default function CourseContentPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [courseData, sectionsData] = await Promise.all([
          api.course.getById(courseId),
          api.section.getByCourse(courseId),
        ]);
        if (!mounted) return;
        setCourse(courseData);
        setSections(
          (sectionsData || []).map((s: SectionBase) => ({
            ...s,
            lectures: s.lectures ?? [],
          })),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingLecture, setEditingLecture] = useState<{
    sectionId: string;
    lecture: Lecture | null;
  }>({ sectionId: "", lecture: null });

  // Form states
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    order: 0,
  });
  const [lectureForm, setLectureForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
    resourceUrl: "",
    duration: 0,
    isFree: false,
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);


  // Section Handlers
  const handleCreateSection = async () => {
    setSubmitting(true);
    try {
      const newSection = await api.section.create(courseId, {
        ...sectionForm,
        order: sections.length,
      });
      setSections([
        ...sections,
        { ...(newSection as SectionBase), lectures: (newSection as SectionBase).lectures ?? [] },
      ]);
      setShowSectionModal(false);
      setSectionForm({ title: "", description: "", order: 0 });
    } catch (error) {
      console.error("Error creating section:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;
    setSubmitting(true);
    try {
      const updated = await api.section.update(
        courseId,
        editingSection.id,
        sectionForm,
      );
      setSections(
        sections.map((s) =>
          s.id === editingSection.id
            ? ({ ...(updated as SectionBase), lectures: (updated as SectionBase).lectures ?? s.lectures })
            : s,
        ),
      );
      setShowSectionModal(false);
      setEditingSection(null);
      setSectionForm({ title: "", description: "", order: 0 });
    } catch (error) {
      console.error("Error updating section:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        "Delete this section and all its lectures? This cannot be undone.",
      )
    )
      return;
    try {
      await api.section.delete(courseId, sectionId);
      setSections(sections.filter((s) => s.id !== sectionId));
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  // Lecture Handlers
  const handleCreateLecture = async () => {
    if (!editingLecture.sectionId) return;
    setSubmitting(true);
    try {
      const newLecture = await api.lecture.create(
        courseId,
        editingLecture.sectionId,
        {
          ...lectureForm,
          order:
            sections.find((s) => s.id === editingLecture.sectionId)?.lectures
              .length || 0,
        },
      );
      setSections(
        sections.map((s) =>
          s.id === editingLecture.sectionId
            ? { ...s, lectures: [...s.lectures, newLecture] }
            : s,
        ),
      );
      setShowLectureModal(false);
      setEditingLecture({ sectionId: "", lecture: null });
      setLectureForm({
        title: "",
        description: "",
        videoUrl: "",
        pdfUrl: "",
        resourceUrl: "",
        duration: 0,
        isFree: false,
        order: 0,
      });
    } catch (error) {
      console.error("Error creating lecture:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLecture = async () => {
    if (!editingLecture.sectionId || !editingLecture.lecture) return;
    setSubmitting(true);
    try {
      const updated = await api.lecture.update(
        courseId,
        editingLecture.sectionId,
        editingLecture.lecture.id,
        lectureForm,
      );
      setSections(
        sections.map((s) =>
          s.id === editingLecture.sectionId
            ? {
                ...s,
                lectures: s.lectures.map((l) =>
                  l.id === editingLecture.lecture?.id ? updated : l,
                ),
              }
            : s,
        ),
      );
      setShowLectureModal(false);
      setEditingLecture({ sectionId: "", lecture: null });
      setLectureForm({
        title: "",
        description: "",
        videoUrl: "",
        pdfUrl: "",
        resourceUrl: "",
        duration: 0,
        isFree: false,
        order: 0,
      });
    } catch (error) {
      console.error("Error updating lecture:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLecture = async (sectionId: string, lectureId: string) => {
    if (!confirm("Delete this lecture? This cannot be undone.")) return;
    try {
      await api.lecture.delete(courseId, sectionId, lectureId);
      setSections(
        sections.map((s) =>
          s.id === sectionId
            ? { ...s, lectures: s.lectures.filter((l) => l.id !== lectureId) }
            : s,
        ),
      );
    } catch (error) {
      console.error("Error deleting lecture:", error);
    }
  };

  // Drag and Drop Handlers
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "section") {
      const reorderedSections = Array.from(sections);
      const [removed] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, removed);

      const updatedSections = reorderedSections.map((section, idx) => ({
        ...section,
        order: idx,
      }));

      setSections(updatedSections);

      // Save to backend
      await api.section.reorder(
        courseId,
        updatedSections.map((s) => ({ id: s.id, order: s.order })),
      );
    }

    if (type === "lecture") {
      const sectionId = source.droppableId;
      const newSectionId = destination.droppableId;

      const sourceSection = sections.find((s) => s.id === sectionId);
      const destSection = sections.find((s) => s.id === newSectionId);

      if (!sourceSection || !destSection) return;

      const reorderedLectures = Array.from(sourceSection.lectures);
      const [removed] = reorderedLectures.splice(source.index, 1);

      if (sectionId === newSectionId) {
        reorderedLectures.splice(destination.index, 0, removed);
        const updatedLectures = reorderedLectures.map((lecture, idx) => ({
          ...lecture,
          order: idx,
        }));

        setSections(
          sections.map((s) =>
            s.id === sectionId ? { ...s, lectures: updatedLectures } : s,
          ),
        );

        await api.lecture.reorder(
          courseId,
          sectionId,
          updatedLectures.map((l) => ({ id: l.id, order: l.order })),
        );
      } else {
        // Moving between sections
        const destLectures = Array.from(destSection.lectures);
        destLectures.splice(destination.index, 0, removed);

        const updatedSourceLectures = reorderedLectures.map((lecture, idx) => ({
          ...lecture,
          order: idx,
        }));

        const updatedDestLectures = destLectures.map((lecture, idx) => ({
          ...lecture,
          order: idx,
        }));

        setSections(
          sections.map((s) => {
            if (s.id === sectionId)
              return { ...s, lectures: updatedSourceLectures };
            if (s.id === newSectionId)
              return { ...s, lectures: updatedDestLectures };
            return s;
          }),
        );

        // Update backend for both sections
        await api.lecture.reorder(
          courseId,
          sectionId,
          updatedSourceLectures.map((l) => ({ id: l.id, order: l.order })),
        );
        await api.lecture.reorder(
          courseId,
          newSectionId,
          updatedDestLectures.map((l) => ({ id: l.id, order: l.order })),
        );
      }
    }
  };

  const openSectionModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        title: section.title,
        description: section.description || "",
        order: section.order,
      });
    } else {
      setEditingSection(null);
      setSectionForm({ title: "", description: "", order: sections.length });
    }
    setShowSectionModal(true);
  };

  const openLectureModal = (sectionId: string, lecture?: Lecture) => {
    if (lecture) {
      setEditingLecture({ sectionId, lecture });
      setLectureForm({
        title: lecture.title,
        description: lecture.description || "",
        videoUrl: lecture.videoUrl || "",
        pdfUrl: lecture.pdfUrl || "",
        resourceUrl: lecture.resourceUrl || "",
        duration: lecture.duration || 0,
        isFree: lecture.isFree,
        order: lecture.order,
      });
    } else {
      setEditingLecture({ sectionId, lecture: null });
      setLectureForm({
        title: "",
        description: "",
        videoUrl: "",
        pdfUrl: "",
        resourceUrl: "",
        duration: 0,
        isFree: false,
        order: 0,
      });
    }
    setShowLectureModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Course Content
              </h1>
              <p className="text-text-secondary text-sm">{course?.title}</p>
            </div>
            <Button onClick={() => openSectionModal()}>
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Section
            </Button>
          </div>
          <div className="mt-4">
            <CourseTabs courseId={courseId} />
          </div>
        </div>
      </header>

      <div className="p-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="section">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {sections.map((section, sectionIndex) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={sectionIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-surface rounded-lg border border-border overflow-hidden"
                      >
                        {/* Section Header */}
                        <div className="flex items-center justify-between p-4 bg-background-secondary border-b border-border">
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move"
                            >
                              <svg
                                className="h-5 w-5 text-text-tertiary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 8h16M4 16h16"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-text-primary">
                                {section.title}
                              </h3>
                              {section.description && (
                                <p className="text-text-secondary text-sm">
                                  {section.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-text-tertiary text-sm">
                              {section.lectures.length} lectures
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSectionModal(section)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Lectures List */}
                        <Droppable droppableId={section.id} type="lecture">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {section.lectures.map((lecture, lectureIndex) => (
                                <Draggable
                                  key={lecture.id}
                                  draggableId={lecture.id}
                                  index={lectureIndex}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-background-hover transition"
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-move"
                                        >
                                          <svg
                                            className="h-4 w-4 text-text-tertiary"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M4 8h16M4 16h16"
                                            />
                                          </svg>
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-text-primary font-medium">
                                              {lecture.title}
                                            </span>
                                            {lecture.isFree && (
                                              <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs">
                                                Preview
                                              </span>
                                            )}
                                            {lecture.videoUrl && (
                                              <span className="text-text-tertiary text-xs">
                                                📹 Video
                                              </span>
                                            )}
                                            {lecture.pdfUrl && (
                                              <span className="text-text-tertiary text-xs">
                                                📄 PDF
                                              </span>
                                            )}
                                          </div>
                                          {lecture.description && (
                                            <p className="text-text-secondary text-sm truncate max-w-md">
                                              {lecture.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {typeof lecture.duration === "number" &&
                                          lecture.duration > 0 && (
                                            <span className="text-text-tertiary text-sm">
                                              {Math.floor(lecture.duration / 60)}:
                                              {(lecture.duration % 60)
                                                .toString()
                                                .padStart(2, "0")}
                                            </span>
                                          )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            openLectureModal(
                                              section.id,
                                              lecture,
                                            )
                                          }
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-400"
                                          onClick={() =>
                                            handleDeleteLecture(
                                              section.id,
                                              lecture.id,
                                            )
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              <button
                                onClick={() => openLectureModal(section.id)}
                                className="w-full p-4 text-center text-primary hover:bg-background-hover transition border-t border-border"
                              >
                                + Add Lecture
                              </button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Section Modal */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingSection ? "Edit Section" : "Add New Section"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                title="section title"
                type="text"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={sectionForm.title}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                title="description"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={sectionForm.description}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setShowSectionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={
                editingSection ? handleUpdateSection : handleCreateSection
              }
              disabled={!sectionForm.title || submitting}
            >
              {submitting ? "Saving..." : editingSection ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lecture Modal */}
      <Modal
        isOpen={showLectureModal}
        onClose={() => setShowLectureModal(false)}
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {editingLecture.lecture ? "Edit Lecture" : "Add New Lecture"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                title="title"
                type="text"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={lectureForm.title}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                title="description"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={lectureForm.description}
                onChange={(e) =>
                  setLectureForm({
                    ...lectureForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Video URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
                value={lectureForm.videoUrl}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, videoUrl: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PDF URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
                value={lectureForm.pdfUrl}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, pdfUrl: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (seconds)
              </label>
              <input
                title="order"
                type="number"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={lectureForm.duration}
                onChange={(e) =>
                  setLectureForm({
                    ...lectureForm,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={lectureForm.isFree}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, isFree: e.target.checked })
                }
              />
              <label htmlFor="isFree" className="text-sm font-medium">
                Make this a free preview (accessible without enrollment)
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setShowLectureModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={
                editingLecture.lecture
                  ? handleUpdateLecture
                  : handleCreateLecture
              }
              disabled={!lectureForm.title || submitting}
            >
              {submitting
                ? "Saving..."
                : editingLecture.lecture
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
