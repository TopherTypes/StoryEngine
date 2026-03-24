import { Card, CardBody, CardHeader } from '../../common/Card'
import { MetadataForm } from '../forms/MetadataForm'
import { ThemeForm } from '../forms/ThemeForm'
import { LoginForm } from '../forms/LoginForm'

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Story Metadata</h3>
          <p className="text-sm text-gray-600 mt-1">Basic information about your story</p>
        </CardHeader>
        <CardBody>
          <MetadataForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Theme & Appearance</h3>
          <p className="text-sm text-gray-600 mt-1">Configure colors, fonts, and UI elements</p>
        </CardHeader>
        <CardBody>
          <ThemeForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Login Screen</h3>
          <p className="text-sm text-gray-600 mt-1">Configure player login credentials and message</p>
        </CardHeader>
        <CardBody>
          <LoginForm />
        </CardBody>
      </Card>
    </div>
  )
}
