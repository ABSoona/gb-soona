import { useDemandeService } from "@/api/demande/demandeService";
import { UPDATE_DEMANDE_ACTIVITY } from "@/api/demande/graphql/queries";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DemandeActivity } from "@/model/demande/Demande";
import { useMutation } from "@apollo/client";
import {
  Ban, CircleCheckBig, ClockAlert, FilePlus2, HeartHandshake, MapPin,
  MoreVertical, Pencil, PhoneCall, PhoneMissed, RefreshCw, RefreshCwOff,
  StickyNote, Trash,
  UserPlus
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  activities: DemandeActivity[];
  demandeId:number
}

const getIconForType = (type: string) => {
  switch (type) {
    case "priseContactReussie": return <PhoneCall className="h-4 w-4 inline mr-2" />;
    case "priseContactEchec": return <PhoneMissed className="h-4 w-4 inline mr-2" />;
    case "note": return <StickyNote className="h-4 w-4 inline mr-2" />;
    case "visite": return <MapPin className="h-4 w-4 inline mr-2" />;
    case "statusUpdate": return <RefreshCw className="h-4 w-4 inline mr-2" />;
    case "abandon": return <RefreshCwOff className="h-4 w-4 inline mr-2" />;
    case "aideAdd": return <HeartHandshake className="h-4 w-4 inline mr-2" />;
    case "docAjout": return <FilePlus2 className="h-4 w-4 inline mr-2" />;
    case "docsRequest": return <FilePlus2 className="h-4 w-4 inline mr-2" />;
    case "expiration": return <ClockAlert className="h-4 w-4 inline mr-2" />;
    case "accept": return <CircleCheckBig className="h-4 w-4 inline mr-2" />;
    case "refuse": return <Ban className="h-4 w-4 inline mr-2" />;
    case "userAssign": return <UserPlus className="h-4 w-4 inline mr-2" />;
    default: return null;
  }
};

export const DemandeActivityTimeline: React.FC<Props> = ({ activities,demandeId }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});
  const [updateDemandeActivity] = useMutation(UPDATE_DEMANDE_ACTIVITY);
  const { deleteDemandeActivity } = useDemandeService({where :{id:{equals:demandeId}}});
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const startEditing = (activity: DemandeActivity) => {
    setEditingId(activity.id);
    setEditingMessage(activity.message ?? "");
  };

  const saveMessage = async (activityId: number) => {
    if (editingMessage.trim() === "") return;
    await updateDemandeActivity({
      variables: {
        id: activityId,
        data: { message: editingMessage },
      },
    });
    setEditingId(null);
  };

  const toggleExpanded = (id: number) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteActivity = async (id: number) => {
    await deleteDemandeActivity(id);
  };

  useEffect(() => {
    if (editingId !== null) {
      setTimeout(() => {
        textareaRefs.current[editingId]?.focus();
      }, 300);
    }
  }, [editingId]);

  return (
    <ol className="relative border-s border-gray-200 dark:border-gray-700">
      <ul className="relative border-s border-gray-200 dark:border-gray-700">
        {activities.map((activity) => (
          <li key={activity.id} className="mb-6 ms-3">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700" />
            <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              {new Date(activity.createdAt).toLocaleString()}
            </time>
            {activity.user && (
              <p className="text-sm text-gray-400 italic mt-1 capitalize">
                Par {activity.user.firstName} {activity.user.lastName}
              </p>
            )}

            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                {getIconForType(activity.typeField)}
                {activity.titre}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEditing(activity)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700"
                    onClick={() => handleDeleteActivity(activity.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 flex flex-col gap-1">
              {editingId === activity.id ? (
                <textarea
                  ref={(el) => { textareaRefs.current[activity.id] = el; }}
                  className="w-full text-sm p-2 border rounded transition-all duration-200 ease-in-out scale-95 opacity-0 animate-fadeIn"
                  value={editingMessage}
                  onChange={(e) => setEditingMessage(e.target.value)}
                  onBlur={() => saveMessage(activity.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveMessage(activity.id);
                    }
                  }}
                />
              ) : (
                <>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={expandedMessages[activity.id] ? 'expanded' : 'collapsed'}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <span className="whitespace-pre-line block">
                        {(activity.message?.length ?? 0) > 180 && !expandedMessages[activity.id]
                          ? activity.message?.slice(0, 180) + '…'
                          : activity.message ?? '—'}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {activity.message && activity.message.length > 180 && (
                    <button
                      onClick={() => toggleExpanded(activity.id)}
                      className="text-blue-600 hover:underline text-sm mt-1 self-start"
                    >
                      {expandedMessages[activity.id] ? 'Voir moins' : 'Voir plus'}
                    </button>
                  )}
                </>
              )}
            </div>

            {activity?.aideId && (
              <a
                href="#"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Voir l'aide
                <svg className="w-3 h-3 ms-2 rtl:rotate-180" fill="none" viewBox="0 0 14 10">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </a>
            )}
          </li>
        ))}
      </ul>
    </ol>
  );
};
