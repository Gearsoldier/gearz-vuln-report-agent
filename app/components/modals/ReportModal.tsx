'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { VaultItem } from '@/app/utils/types';
import { X } from 'lucide-react';

export default function ReportModal({ report, onClose }: { report: VaultItem; onClose: () => void }) {
  return (
    <Dialog.Root open={!!report} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
        <Dialog.Content className="fixed z-50 top-[10%] left-1/2 -translate-x-1/2 w-[90%] md:w-[700px] bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Dialog.Title className="text-xl font-bold">{report.title}</Dialog.Title>
              <p className="text-sm text-gray-400">{new Date(report.timestamp).toLocaleString()}</p>
              {report.severity && (
                <span className="text-white text-xs font-semibold px-2 py-1 bg-orange-600 rounded mt-1 inline-block">
                  {report.severity.toUpperCase()}
                </span>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="text-white hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto max-h-[70vh] prose prose-invert whitespace-pre-wrap text-sm">
            {report.content}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
