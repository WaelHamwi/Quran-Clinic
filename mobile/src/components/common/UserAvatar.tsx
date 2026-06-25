import React from 'react';
import { Image, Text, View } from 'react-native';
import { avatarContainerStyle, avatarImageStyle, initialsTextStyle } from './UserAvatar.styles';

interface Props {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

export function UserAvatar({ uri, name, size = 48 }: Props) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  if (uri) {
    return <Image source={{ uri }} style={avatarImageStyle(size)} />;
  }

  return (
    <View style={avatarContainerStyle(size)}>
      <Text style={initialsTextStyle(size)}>{initials}</Text>
    </View>
  );
}
