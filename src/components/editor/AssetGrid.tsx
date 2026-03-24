import { Trash2, Music, Image as ImageIcon } from 'lucide-react'
import { Button } from '../common/Button'
import type { Asset } from '../../types'

interface AssetGridProps {
  assets: Asset[]
  onDelete: (assetId: string) => void
}

export function AssetGrid({ assets, onDelete }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No assets uploaded yet</p>
      </div>
    )
  }

  const imageAssets = assets.filter((a) => a.type === 'image')
  const audioAssets = assets.filter((a) => a.type === 'audio')

  return (
    <div className="space-y-6">
      {imageAssets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Images</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageAssets.map((asset) => (
              <div key={asset.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {asset.data.startsWith('data:image') ? (
                    <img src={asset.data} alt={asset.filename} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs font-medium text-gray-900 truncate">{asset.filename}</p>
                  <p className="text-xs text-gray-600 mt-1">{(asset.size / 1024).toFixed(1)} KB</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(asset.id)}
                      className="flex-1 p-1 h-auto text-red-600 hover:bg-red-50 text-xs gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {audioAssets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Audio</h4>
          <div className="space-y-2">
            {audioAssets.map((asset) => (
              <div key={asset.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Music className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{asset.filename}</p>
                    <p className="text-xs text-gray-600">{(asset.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(asset.id)}
                  className="p-1 h-auto text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
