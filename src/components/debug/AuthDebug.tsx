import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

const AuthDebug: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const { userRole, permissions, canAccess } = useRoleBasedAccess();
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    const testUserId = localStorage.getItem('test_user_id');
    const testUserData = localStorage.getItem('test_user_data');
    
    setLocalStorageData({
      test_user_id: testUserId,
      test_user_data: testUserData ? JSON.parse(testUserData) : null
    });
  }, []);

  const refreshData = () => {
    const testUserId = localStorage.getItem('test_user_id');
    const testUserData = localStorage.getItem('test_user_data');
    
    setLocalStorageData({
      test_user_id: testUserId,
      test_user_data: testUserData ? JSON.parse(testUserData) : null
    });
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Debug de Autenticação
            <Button onClick={refreshData} size="sm" variant="outline">
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Estado do AuthProvider:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Badge variant={loading ? "destructive" : "default"}>
                  Loading: {loading ? "Sim" : "Não"}
                </Badge>
              </div>
              <div>
                <Badge variant={user ? "default" : "destructive"}>
                  User: {user ? "Presente" : "Ausente"}
                </Badge>
              </div>
              <div>
                <Badge variant={userProfile ? "default" : "destructive"}>
                  UserProfile: {userProfile ? "Presente" : "Ausente"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Dados do Usuário:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify({
                user: user ? { id: user.id, email: user.email } : null,
                userProfile: userProfile ? { 
                  user_id: userProfile.user_id, 
                  role: userProfile.role,
                  full_name: userProfile.full_name 
                } : null
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Estado do useRoleBasedAccess:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Badge variant="outline">
                  Role: {userRole}
                </Badge>
              </div>
              <div>
                <Badge variant={canAccess('canManageCheckins') ? "default" : "destructive"}>
                  Checkins: {canAccess('canManageCheckins') ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">LocalStorage:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Permissões:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(permissions, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebug;
