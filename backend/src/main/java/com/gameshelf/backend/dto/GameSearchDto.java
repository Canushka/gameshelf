package com.gameshelf.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameSearchDto {

    private Long id;

    private String name;

    private String summary;

    private String coverUrl;

    private Long firstReleaseDate;

    private Double rating;

    private Integer ratingCount;

    private List<String> genres;
}