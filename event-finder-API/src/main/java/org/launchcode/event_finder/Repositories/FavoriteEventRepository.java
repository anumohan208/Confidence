package org.launchcode.event_finder.Repositories;

import org.launchcode.event_finder.Models.FavoriteEvent;
import org.launchcode.event_finder.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteEventRepository extends JpaRepository<FavoriteEvent, Long> {
    List<FavoriteEvent> findByUser(User user);
}

